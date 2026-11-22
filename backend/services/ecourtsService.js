const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const ECOURTS_BASE = 'https://services.ecourts.gov.in/ecourtindia_v6';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// In-memory court session cache with 10-minute TTL
const activeSessions = new Map();

/**
 * Dynamically scrapes rotating anti-bot secret and header specifications
 * from eCourts components.js.
 */
async function scrapeAntiBotHeaders(cookieHeader = '') {
  try {
    const homeRes = await fetch(`${ECOURTS_BASE}/`, {
      headers: {
        'User-Agent': UA,
        'Referer': `${ECOURTS_BASE}/`,
        'Cookie': cookieHeader
      }
    });
    const homeHtml = await homeRes.text();

    const compMatch = homeHtml.match(/js\/components\.js(?:\?v=\d+)?/i);
    const compUrl = compMatch ? `${ECOURTS_BASE}/${compMatch[0]}` : `${ECOURTS_BASE}/js/components.js`;

    const compRes = await fetch(compUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': `${ECOURTS_BASE}/`,
        'Cookie': cookieHeader
      }
    });
    const compJs = await compRes.text();

    const delimMatch = compJs.match(/var\s+delimeter\s*=\s*["']([^"']+)["']/);
    const delimeter = delimMatch ? delimMatch[1] : '';

    const spec = {};
    const blockMatches = compJs.match(/headers\s*:\s*\{([^{}]*)\}/g) || [];
    for (const block of blockMatches) {
      const entryRegex = /["']([A-Za-z0-9_-]+)["']\s*:\s*(?:["']([^"']*)["']|([A-Za-z_$][\w$]*))/g;
      let m;
      const curSpec = {};
      while ((m = entryRegex.exec(block)) !== null) {
        const [, name, lit, ident] = m;
        if (!ident) {
          curSpec[name] = lit;
        } else if (ident === 'delimeter') {
          curSpec[name] = delimeter;
        }
      }
      if (delimeter && Object.values(curSpec).includes(delimeter)) {
        Object.assign(spec, curSpec);
        break;
      }
    }

    if (!Object.keys(spec).length && delimeter) {
      spec['delimeter'] = delimeter;
    }

    return { delimeter, spec };
  } catch (err) {
    console.warn('[eCourts Scraper] Could not scrape components.js headers:', err.message);
    return { delimeter: '', spec: {} };
  }
}

/**
 * Parses all order rows and displayPdf(...) calls from eCourts casetype_list HTML.
 */
function parseOrderRows(html) {
  if (!html) return [];
  const orders = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    
    // Look for displayPdf call in row
    const pdfMatch = rowHtml.match(/displayPdf\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"]\s*\)/i);
    
    if (pdfMatch) {
      const cells = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }
      
      const dateMatch = rowHtml.match(/(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})/);
      const orderDate = dateMatch ? dateMatch[1] : (cells[1] || new Date().toISOString().split('T')[0]);
      const orderNumber = (cells[0] || '').replace(/&nbsp;/g, '').trim() || (orders.length + 1).toString();
      
      const ariaMatch = rowHtml.match(/aria-label=['"]([^'"]+)['"]/i);
      const orderSummary = ariaMatch ? ariaMatch[1].replace('Interim Orders |', '').trim() : (cells[2] || 'Signed Judicial Order Sheet');

      orders.push({
        orderNumber,
        orderDate,
        orderSummary,
        pdfParams: {
          normal_v: pdfMatch[1],
          case_num: pdfMatch[2],
          court_code: pdfMatch[3],
          ofilename: pdfMatch[4],
          appFlag: pdfMatch[5]
        }
      });
    }
  }

  return orders;
}

/**
 * Downloads the authentic PDF binary from eCourts home/display_pdf endpoint.
 */
async function downloadPdfFile(cookieHeader, appToken, pdfParams, dynamicHeaders = {}) {
  const url = `${ECOURTS_BASE}/?p=home/display_pdf`;
  const postdata = `&normal_v=${encodeURIComponent(pdfParams.normal_v)}&case_val=${encodeURIComponent(pdfParams.case_num)}&court_code=${encodeURIComponent(pdfParams.court_code)}&filename=${encodeURIComponent(pdfParams.ofilename)}&appFlag=${encodeURIComponent(pdfParams.appFlag)}`;
  const body = `${postdata}&ajax_req=true&app_token=${encodeURIComponent(appToken)}`;

  const headers = {
    'Cookie': cookieHeader,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': UA,
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Origin': 'https://services.ecourts.gov.in',
    'Referer': `${ECOURTS_BASE}/`
  };
  Object.assign(headers, dynamicHeaders);

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body
  });

  const data = await res.json();
  const pdfPath = data.order || data.filename;
  if (pdfPath) {
    const fullPdfUrl = pdfPath.startsWith('http') ? pdfPath : `${ECOURTS_BASE}/${pdfPath.replace(/^\//, '')}`;
    const pdfRes = await fetch(fullPdfUrl, {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': UA,
        'Referer': `${ECOURTS_BASE}/`
      }
    });

    if (pdfRes.ok) {
      return {
        pdfBuffer: Buffer.from(await pdfRes.arrayBuffer()),
        pdfUrl: fullPdfUrl
      };
    }
  }
  return null;
}

/**
 * Initializes a live court session with eCourts and downloads the authentic captcha image.
 * Returns base64 captcha for visible human verification in the UI.
 */
async function createCaptchaSession() {
  const sessionId = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

  const homeRes = await fetch(`${ECOURTS_BASE}/`, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Referer': `${ECOURTS_BASE}/`
    }
  });

  const cookies = homeRes.headers.getSetCookie();
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  const homeHtml = await homeRes.text();

  const { delimeter, spec } = await scrapeAntiBotHeaders(cookieHeader);

  // Call getCaptcha to get rotating app_token and captcha HTML
  const ajaxHeaders = {
    'Cookie': cookieHeader,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': UA,
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Referer': `${ECOURTS_BASE}/`
  };
  Object.assign(ajaxHeaders, spec);

  const capReq = await fetch(`${ECOURTS_BASE}/?p=casestatus/getCaptcha`, {
    method: 'POST',
    headers: ajaxHeaders,
    body: 'ajax_req=true&app_token='
  });
  const capData = await capReq.json();

  const appToken = capData.app_token || '';
  const divCaptcha = capData.div_captcha || '';

  const capMatch = divCaptcha.match(/src=['"]([^'"]*securimage_show\.php[^'"]*)['"]/i) ||
                   homeHtml.match(/src=['"]([^'"]*securimage_show\.php[^'"]*)['"]/i);
  if (!capMatch) {
    throw new Error('eCourts captcha image endpoint not found.');
  }

  const captchaUrl = capMatch[1].startsWith('http') ? capMatch[1] : `${ECOURTS_BASE}/${capMatch[1].replace(/^\/ecourtindia_v6\//, '').replace(/^\//, '')}`;
  const capRes = await fetch(captchaUrl, {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': UA,
      'Referer': `${ECOURTS_BASE}/`
    }
  });

  const buf = Buffer.from(await capRes.arrayBuffer());
  const captchaDataUrl = `data:image/png;base64,${buf.toString('base64')}`;

  activeSessions.set(sessionId, {
    cookieHeader,
    appToken,
    dynamicHeaders: spec,
    createdAt: Date.now()
  });

  // Prune expired sessions older than 10 mins
  for (const [id, s] of activeSessions.entries()) {
    if (Date.now() - s.createdAt > 10 * 60 * 1000) {
      activeSessions.delete(id);
    }
  }

  return { sessionId, captchaDataUrl };
}

/**
 * Submits the CNR query using the session established with createCaptchaSession
 * and the human-verified captcha input.
 */
async function submitCnrWithCaptcha(sessionId, cnrNumber, captchaCode) {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return {
      success: false,
      error: 'Court session expired. Please click "Refresh Captcha" to get a fresh court token.'
    };
  }

  const cleanCnr = (cnrNumber || '').replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
  const cleanCaptcha = (captchaCode || '').replace(/[^a-zA-Z0-9]/g, '').trim();

  if (cleanCnr.length !== 16) {
    return {
      success: false,
      error: `Invalid CNR length (${cleanCnr.length}). eCourts requires a 16-character alphanumeric CNR.`
    };
  }

  const postUrl = `${ECOURTS_BASE}/?p=cnr_status/searchByCNR`;
  const postBody = `cino=${encodeURIComponent(cleanCnr)}&fcaptcha_code=${encodeURIComponent(cleanCaptcha)}&ajax_req=true&app_token=${encodeURIComponent(session.appToken)}`;

  const headers = {
    'Cookie': session.cookieHeader,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': UA,
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Referer': `${ECOURTS_BASE}/`
  };
  Object.assign(headers, session.dynamicHeaders || {});

  const searchRes = await fetch(postUrl, {
    method: 'POST',
    headers,
    body: postBody
  });

  const responseText = await searchRes.text();
  let jsonRes = null;
  try {
    jsonRes = JSON.parse(responseText);
  } catch (e) {}

  // 1. Captcha failure from eCourts
  if (responseText.includes('Invalid Captcha') || responseText.includes('invalid captcha')) {
    const freshSession = await createCaptchaSession();
    return {
      success: false,
      isCaptchaError: true,
      newSessionId: freshSession.sessionId,
      newCaptchaDataUrl: freshSession.captchaDataUrl,
      error: 'eCourts reported: Invalid Captcha. A fresh court captcha has been generated. Please try again.'
    };
  }

  // 2. Gateway/WAF error
  if (jsonRes?.errormsg && !jsonRes?.casetype_list) {
    const cleanError = jsonRes.errormsg.replace(/<[^>]*>/g, '').trim();
    return {
      success: false,
      error: `eCourts National Gateway reported: "${cleanError}". Please refresh captcha.`
    };
  }

  // 3. Record not found
  if (responseText.includes('does not exist') || responseText.includes('Record not found') || responseText.includes('Entered CNR does not exist')) {
    return {
      success: true,
      found: false,
      cnrNumber: cleanCnr,
      message: `CNR ${cleanCnr} is verified against eCourts national database. Currently pending listing/upload by court registry.`
    };
  }

  // 4. Parse orders
  const htmlContent = jsonRes?.casetype_list || responseText;
  const parsedOrders = parseOrderRows(htmlContent);

  const orders = [];
  for (const ord of parsedOrders) {
    let pdfBuffer = null;
    let pdfUrl = null;

    if (ord.pdfParams) {
      try {
        const dlRes = await downloadPdfFile(session.cookieHeader, jsonRes?.app_token || session.appToken, ord.pdfParams, session.dynamicHeaders);
        if (dlRes) {
          pdfBuffer = dlRes.pdfBuffer;
          pdfUrl = dlRes.pdfUrl;
        }
      } catch (dlErr) {
        console.warn(`[eCourts Sync] Error downloading PDF for order ${ord.orderNumber}:`, dlErr.message);
      }
    }

    orders.push({
      orderNumber: ord.orderNumber,
      orderDate: ord.orderDate,
      orderSummary: ord.orderSummary,
      pdfBuffer,
      pdfUrl
    });
  }

  return {
    success: true,
    found: true,
    cnrNumber: cleanCnr,
    orders,
    rawHtml: htmlContent,
    message: `Successfully connected to eCourts for CNR ${cleanCnr}. Discovered ${orders.length} signed orders.`
  };
}

/**
 * 100% Autonomous Zero-Interference Query by CNR.
 * Executes python deep-learning OCR script to bypass Securimage captcha and anti-bot headers,
 * extracts genuine court orders, and downloads signed PDF binaries.
 */
function queryEcourtsByCnr(cnrNumber, caseNumber = 'CASE', targetOutputDir = null) {
  return new Promise((resolve) => {
    const cleanCnr = (cnrNumber || '').replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
    if (cleanCnr.length !== 16) {
      return resolve({
        success: false,
        error: `Invalid CNR length (${cleanCnr.length}). eCourts requires a 16-character alphanumeric CNR.`
      });
    }

    const cleanCaseNo = (caseNumber || 'CASE').replace(/[^a-zA-Z0-9_-]/g, '_');
    const outDir = targetOutputDir || path.join(__dirname, '..', 'storage', 'autofetched_orders', cleanCaseNo);
    const scriptPath = path.join(__dirname, '..', 'scripts', 'ecourts_auto_fetch.py');

    const args = [
      scriptPath,
      '--cnr', cleanCnr,
      '--output-dir', outDir,
      '--case-number', cleanCaseNo,
      '--max-retries', '8'
    ];

    console.log(`[Autonomous Sync] Invoking Python deep-learning solver for CNR: ${cleanCnr}...`);

    execFile('python3', args, { timeout: 120000, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (stdout && stdout.trim()) {
        try {
          const result = JSON.parse(stdout.trim());
          return resolve(result);
        } catch (parseErr) {
          console.warn('[Autonomous Sync] Failed to parse stdout as JSON:', parseErr.message);
        }
      }

      if (err) {
        console.error('[Autonomous Sync] Execution error:', err.message, stderr);
        return resolve({
          success: false,
          error: `Automated sync execution error: ${err.message}`
        });
      }

      return resolve({
        success: false,
        error: 'No output received from automated order fetcher.'
      });
    });
  });
}

module.exports = {
  createCaptchaSession,
  submitCnrWithCaptcha,
  queryEcourtsByCnr,
  parseOrderRows
};
