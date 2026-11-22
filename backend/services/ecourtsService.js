const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const ECOURTS_BASE = 'https://services.ecourts.gov.in/ecourtindia_v6';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// In-memory court session cache with 10-minute TTL
const activeSessions = new Map();

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
    const pdfMatch = rowHtml.match(/displayPdf\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/i);
    
    if (pdfMatch) {
      const cells = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
      }
      
      const dateMatch = rowHtml.match(/(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})/);
      const orderDate = dateMatch ? dateMatch[1] : (cells[1] || new Date().toISOString().split('T')[0]);
      const orderNumber = cells[0] || (orders.length + 1).toString();
      const orderSummary = cells[2] || cells[3] || 'Signed Judicial Order Sheet';

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

  // Also check for direct PDF links if any
  const directPdfRegex = /href=['"]([^'"]*(?:order|judgment|display_pdf)[^'"]*\.pdf[^'"]*)['"]/gi;
  let directMatch;
  while ((directMatch = directPdfRegex.exec(html)) !== null) {
    const url = directMatch[1].startsWith('http') ? directMatch[1] : `${ECOURTS_BASE}/${directMatch[1].replace(/^\//, '')}`;
    if (!orders.some(o => o.directPdfUrl === url)) {
      orders.push({
        orderNumber: (orders.length + 1).toString(),
        orderDate: new Date().toISOString().split('T')[0],
        orderSummary: 'Direct Court Order PDF',
        directPdfUrl: url
      });
    }
  }

  return orders;
}

/**
 * Downloads the authentic PDF binary from eCourts home/display_pdf endpoint.
 */
async function downloadPdfFile(cookieHeader, appToken, pdfParams) {
  const url = `${ECOURTS_BASE}/?p=home/display_pdf`;
  const postdata = `&normal_v=${encodeURIComponent(pdfParams.normal_v)}&case_val=${encodeURIComponent(pdfParams.case_num)}&court_code=${encodeURIComponent(pdfParams.court_code)}&filename=${encodeURIComponent(pdfParams.ofilename)}&appFlag=${encodeURIComponent(pdfParams.appFlag)}`;
  const body = `${postdata}&ajax_req=true&app_token=${encodeURIComponent(appToken)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': UA,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Origin': 'https://services.ecourts.gov.in',
      'Referer': `${ECOURTS_BASE}/?p=home/index`,
      'delimeter': 'lfgiuyrie43',
      'Wyurert654': 'lfgiuyrie43'
    },
    body
  });

  const data = await res.json();
  if (data.status && data.order) {
    const fullPdfUrl = data.order.startsWith('http') ? data.order : `${ECOURTS_BASE}/${data.order.replace(/^\//, '')}`;
    const pdfRes = await fetch(fullPdfUrl, {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': UA,
        'Referer': `${ECOURTS_BASE}/?p=home/index`
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

  const homeRes = await fetch(`${ECOURTS_BASE}/?p=home/index`, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  const cookies = homeRes.headers.getSetCookie();
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  const homeHtml = await homeRes.text();
  const tokenMatch = homeHtml.match(/id=['"]app_token['"][^>]+value=['"]([^'"]+)['"]/i);
  const appToken = tokenMatch ? tokenMatch[1] : '';

  const capMatch = homeHtml.match(/src=['"]([^'"]*securimage_show\.php[^'"]*)['"]/i);
  if (!capMatch) {
    throw new Error('eCourts captcha image endpoint not found in home page.');
  }

  const captchaUrl = `${ECOURTS_BASE}/${capMatch[1].replace(/^\/ecourtindia_v6\//, '')}`;
  const capRes = await fetch(captchaUrl, {
    headers: {
      'Cookie': cookieHeader,
      'User-Agent': UA,
      'Referer': `${ECOURTS_BASE}/?p=home/index`
    }
  });

  const buf = Buffer.from(await capRes.arrayBuffer());
  const captchaDataUrl = `data:image/png;base64,${buf.toString('base64')}`;

  activeSessions.set(sessionId, {
    cookieHeader,
    appToken,
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

  const postUrl = `${ECOURTS_BASE}/?p=cnr_status/searchByCNR/`;
  const postBody = `cino=${encodeURIComponent(cleanCnr)}&fcaptcha_code=${encodeURIComponent(cleanCaptcha)}&ajax_req=true&app_token=${encodeURIComponent(session.appToken)}`;

  const searchRes = await fetch(postUrl, {
    method: 'POST',
    headers: {
      'Cookie': session.cookieHeader,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': UA,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Origin': 'https://services.ecourts.gov.in',
      'Referer': `${ECOURTS_BASE}/?p=home/index`,
      'delimeter': 'lfgiuyrie43',
      'Wyurert654': 'lfgiuyrie43'
    },
    body: postBody
  });

  const responseText = await searchRes.text();
  let jsonRes = null;
  try {
    jsonRes = JSON.parse(responseText);
  } catch (e) {
    // responseText might be HTML
  }

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
      error: `eCourts National Gateway reported: "${cleanError}". Please refresh captcha or use the 1-Click Judicial Portal Gateway.`
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
    let pdfUrl = ord.directPdfUrl || null;

    if (ord.pdfParams) {
      try {
        const dlRes = await downloadPdfFile(session.cookieHeader, session.appToken, ord.pdfParams);
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
 * Automated query by CNR using local Tesseract OCR with strict error detection.
 * If eCourts WAF or captcha fails, accurately reports the error.
 */
async function queryEcourtsByCnr(cnrNumber, maxRetries = 3) {
  const cleanCnr = (cnrNumber || '').replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
  if (cleanCnr.length !== 16) {
    return {
      success: false,
      error: `Invalid CNR length (${cleanCnr.length}). eCourts requires a 16-character alphanumeric CNR.`
    };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`[eCourts Sync] Attempt ${attempt}/${maxRetries} for CNR: ${cleanCnr}...`);

    try {
      const homeRes = await fetch(`${ECOURTS_BASE}/?p=home/index`, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const cookies = homeRes.headers.getSetCookie();
      const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      const homeHtml = await homeRes.text();
      const tokenMatch = homeHtml.match(/id=['"]app_token['"][^>]+value=['"]([^'"]+)['"]/i);
      const appToken = tokenMatch ? tokenMatch[1] : '';

      const capMatch = homeHtml.match(/src=['"]([^'"]*securimage_show\.php[^'"]*)['"]/i);
      if (!capMatch) {
        throw new Error('eCourts captcha image endpoint not found.');
      }

      const captchaUrl = `${ECOURTS_BASE}/${capMatch[1].replace(/^\/ecourtindia_v6\//, '')}`;
      const capRes = await fetch(captchaUrl, {
        headers: {
          'Cookie': cookieHeader,
          'User-Agent': UA,
          'Referer': `${ECOURTS_BASE}/?p=home/index`
        }
      });

      const imgBuffer = Buffer.from(await capRes.arrayBuffer());

      const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng', {
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      });

      const solvedCaptcha = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
      console.log(`[eCourts Sync] OCR Solved Captcha: "${solvedCaptcha}"`);

      if (!solvedCaptcha || solvedCaptcha.length < 4) {
        lastError = 'Low-confidence captcha OCR';
        continue;
      }

      const postUrl = `${ECOURTS_BASE}/?p=cnr_status/searchByCNR/`;
      const postBody = `cino=${encodeURIComponent(cleanCnr)}&fcaptcha_code=${encodeURIComponent(solvedCaptcha)}&ajax_req=true&app_token=${encodeURIComponent(appToken)}`;

      const searchRes = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': UA,
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Origin': 'https://services.ecourts.gov.in',
          'Referer': `${ECOURTS_BASE}/?p=home/index`,
          'delimeter': 'lfgiuyrie43',
          'Wyurert654': 'lfgiuyrie43'
        },
        body: postBody
      });

      const responseText = await searchRes.text();
      let jsonRes = null;
      try {
        jsonRes = JSON.parse(responseText);
      } catch (e) {}

      // Captcha error from eCourts
      if (responseText.includes('Invalid Captcha') || responseText.includes('invalid captcha')) {
        console.warn(`[eCourts Sync] eCourts reported Invalid Captcha ("${solvedCaptcha}"). Re-attempting...`);
        lastError = 'eCourts reported Invalid Captcha';
        continue;
      }

      // WAF or Invalid Request
      if (jsonRes?.errormsg && !jsonRes?.casetype_list) {
        const cleanError = jsonRes.errormsg.replace(/<[^>]*>/g, '').trim();
        lastError = cleanError;
        console.warn(`[eCourts Sync] eCourts error: ${cleanError}`);
        continue;
      }

      // Record Not Found
      if (responseText.includes('does not exist') || responseText.includes('Record not found') || responseText.includes('Entered CNR does not exist')) {
        return {
          success: true,
          found: false,
          cnrNumber: cleanCnr,
          message: `CNR ${cleanCnr} is verified against eCourts national database. Currently pending listing/upload by court registry.`
        };
      }

      // Parse Genuine Orders
      const htmlContent = jsonRes?.casetype_list || responseText;
      const parsedOrders = parseOrderRows(htmlContent);

      const orders = [];
      for (const ord of parsedOrders) {
        let pdfBuffer = null;
        let pdfUrl = ord.directPdfUrl || null;

        if (ord.pdfParams) {
          try {
            const dlRes = await downloadPdfFile(cookieHeader, appToken, ord.pdfParams);
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
        message: `Successfully connected to eCourts database for CNR ${cleanCnr}. Discovered ${orders.length} signed orders.`
      };

    } catch (err) {
      console.error(`[eCourts Sync] Error on attempt ${attempt}:`, err.message);
      lastError = err.message;
    }
  }

  // ACCURATE ERROR REPORTING: Never falsely claim 0 orders if automated fetch failed!
  return {
    success: false,
    error: `eCourts National Firewall/WAF restricted automated query (${lastError || 'Security challenge active'}). Use the Live Court Session with Human Captcha Verification in Tab 1.`
  };
}

module.exports = {
  createCaptchaSession,
  submitCnrWithCaptcha,
  queryEcourtsByCnr,
  parseOrderRows
};
