const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'https://www.calcuttahighcourt.gov.in';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// In-memory session store for Calcutta High Court live sessions with 10-minute TTL
const activeCalHcSessions = new Map();

/**
 * Determines whether a case belongs to Calcutta High Court
 */
function isCalcuttaHighCourtCase({ courtCode = '', courtName = '', cnrNumber = '', caseNumber = '' } = {}) {
  const text = `${courtCode} ${courtName} ${cnrNumber} ${caseNumber}`.toUpperCase();
  return (
    text.includes('CAL_HC') ||
    text.includes('CALCUTTA HIGH COURT') ||
    text.includes('CALCUTTA HC') ||
    text.includes('WBHC') ||
    text.includes('WBCHCA') ||
    text.includes('WBCHCO') ||
    text.includes('WBCHCJ') ||
    text.includes('WBCHCP')
  );
}

/**
 * Case Type Dictionary for Calcutta High Court
 */
const CASE_TYPE_CODES = {
  WBCHCA: {
    'WPA': 12, 'MAT': 25, 'MA': 21, 'FMA': 19, 'FMAT': 8, 'CO': 15,
    'FA': 9, 'FAT': 6, 'SA': 10, 'SAT': 7, 'SMA': 29, 'CRA': 11,
    'CRR': 16, 'CRM': 17, 'CRM(DB)': 57, 'CRM(SB)': 56, 'CRM(A)': 58,
    'CRM(M)': 74, 'WPLRT': 39, 'WPA(P)': 48, 'WPA(H)': 49, 'FMAT(MV)': 52,
    'FMAT(IR)': 51, 'FMAT(WC)': 50, 'WP.WT': 45, 'WPDRT': 47, 'AD-COM': 73, 'AO-COM': 72
  },
  WBCHCO: {
    'CS': 52, 'CS-COM': 117, 'AP': 28, 'AP-COM': 118, 'APO': 31, 'GA': 27,
    'GA-COM': 123, 'TS-COM': 125, 'MS-COM': 126, 'AD-COM': 134, 'AO-COM': 119,
    'CC-COM': 124, 'EC-COM': 122, 'TA-COM': 131, 'IP-COM': 121, 'APD': 29, 'APDT': 30
  },
  WBCHCJ: { 'WPA': 12, 'MAT': 25, 'FMA': 19, 'CO': 15, 'CRA': 11, 'CRM': 17, 'FA': 9 },
  WBCHCP: { 'WPA': 12, 'MAT': 25, 'FMA': 19, 'CO': 15, 'CRA': 11, 'CRM': 17, 'FA': 9 }
};

/**
 * Extracts establishment, case type code, registration number, and filing year
 */
function parseCaseParams({ caseNumber = '', caseType = '', cnrNumber = '', courtCode = '', courtName = '' } = {}) {
  let est = 'WBCHCA';
  const full = `${courtCode} ${courtName} ${cnrNumber} ${caseNumber}`.toUpperCase();

  if (full.includes('ORIGINAL') || full.includes('CAL_HC_OS') || full.includes('WBCHCO') || full.includes('WBHC02')) {
    est = 'WBCHCO';
  } else if (full.includes('JALPAIGURI') || full.includes('WBCHCJ') || full.includes('WBHC03')) {
    est = 'WBCHCJ';
  } else if (full.includes('PORT BLAIR') || full.includes('PORTBLAIR') || full.includes('WBCHCP') || full.includes('WBHC04')) {
    est = 'WBCHCP';
  }

  let extractedType = '';
  let regNo = '';
  let year = '';

  if (caseNumber) {
    const m = caseNumber.match(/([A-Za-z.\s-]+?)\s*(?:\/|\s+of\s+|\s+)?\s*(\d+)\s*(?:\/|\s+of\s+|\s+)?\s*(\d{4})/i);
    if (m) {
      extractedType = m[1].replace(/[^A-Za-z-]/g, '').toUpperCase();
      regNo = parseInt(m[2], 10).toString();
      year = m[3];
    }
  }

  if (!extractedType && caseType) {
    const tm = caseType.match(/^([A-Za-z-]+)/);
    if (tm) extractedType = tm[1].toUpperCase();
  }

  if ((!regNo || !year) && cnrNumber) {
    const cm = cnrNumber.toUpperCase().match(/(?:WBHC\d{2}|WBCHCA|WBCHCO|WBCHCJ|WBCHCP)-?0*(\d+)-?(\d{4})/);
    if (cm) {
      if (!regNo) regNo = parseInt(cm[1], 10).toString();
      if (!year) year = cm[2];
    }
  }

  const estMap = CASE_TYPE_CODES[est] || CASE_TYPE_CODES.WBCHCA;
  const alias = {
    'WP': 'WPA',
    'WRIT': 'WPA',
    'WRITPETITION': 'WPA',
    'MANDAMUS': 'MAT',
    'MANDAMUSAPPEAL': 'MAT',
    'CIVILAPPEAL': 'FMA',
    'CIVILSUIT': 'CS',
    'SUIT': 'CS'
  };

  const normType = alias[extractedType] || extractedType;
  let typeCode = estMap[normType];

  if (!typeCode) {
    for (const [k, v] of Object.entries(estMap)) {
      if (k.replace(/[^A-Z0-9]/g, '') === normType.replace(/[^A-Z0-9]/g, '')) {
        typeCode = v;
        break;
      }
    }
  }

  if (!typeCode) {
    typeCode = est === 'WBCHCO' ? 52 : 12; // Default to WPA or CS
  }

  return {
    est,
    typeCode: typeCode.toString(),
    regNo,
    year,
    typeLabel: extractedType || 'WPA'
  };
}

/**
 * Initializes a live court session with Calcutta High Court and downloads captcha.
 */
async function createCalcuttaHighCourtSession() {
  const sessionId = 'calhc_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

  const homeRes = await fetch(`${BASE_URL}/highcourt_order_search`, {
    headers: { 'User-Agent': UA }
  });
  const html = await homeRes.text();
  const cookies = homeRes.headers.getSetCookie();
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  const tokenMatch = html.match(/name=["']_token["']\s+value=["']([^"']+)["']/);
  const csrfToken = tokenMatch ? tokenMatch[1] : '';

  if (!csrfToken) {
    throw new Error('Failed to obtain CSRF session token from Calcutta High Court.');
  }

  // Fetch fresh captcha
  const refRes = await fetch(`${BASE_URL}/Refresh-Captcha`, {
    headers: {
      'User-Agent': UA,
      'Referer': `${BASE_URL}/highcourt_order_search`,
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': cookieHeader
    }
  });
  const refHtml = await refRes.text();
  const capSrcMatch = refHtml.match(/src=["']([^"']*captcha\/default[^"']*)["']/);
  let capUrl = capSrcMatch ? capSrcMatch[1] : '';
  if (!capUrl.startsWith('http')) {
    capUrl = `${BASE_URL}/${capUrl.replace(/^\//, '')}`;
  }

  const capImgRes = await fetch(capUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': `${BASE_URL}/highcourt_order_search`,
      'Cookie': cookieHeader
    }
  });

  const buf = Buffer.from(await capImgRes.arrayBuffer());
  const captchaDataUrl = `data:image/png;base64,${buf.toString('base64')}`;

  activeCalHcSessions.set(sessionId, {
    cookieHeader,
    csrfToken,
    createdAt: Date.now()
  });

  // Prune expired sessions older than 10 mins
  for (const [id, s] of activeCalHcSessions.entries()) {
    if (Date.now() - s.createdAt > 10 * 60 * 1000) {
      activeCalHcSessions.delete(id);
    }
  }

  return {
    sessionId,
    captchaDataUrl,
    courtType: 'CALCUTTA_HIGH_COURT'
  };
}

/**
 * Submits Calcutta High Court search with human-entered captcha
 */
async function submitCalcuttaHighCourtWithCaptcha(sessionId, {
  caseNumber = '',
  caseType = '',
  cnrNumber = '',
  courtCode = '',
  courtName = '',
  captchaCode = ''
} = {}) {
  const session = activeCalHcSessions.get(sessionId);
  if (!session) {
    return {
      success: false,
      error: 'Calcutta High Court session expired. Please refresh the captcha to obtain a fresh token.'
    };
  }

  const cleanCaptcha = (captchaCode || '').trim();
  const parsed = parseCaseParams({ caseNumber, caseType, cnrNumber, courtCode, courtName });

  if (!parsed.regNo || !parsed.year) {
    return {
      success: false,
      error: `Could not identify registration number and year from case: "${caseNumber}". Please ensure format like "WPA 1 of 2024" or "M.A. 88 of 2026".`
    };
  }

  const formBody = new URLSearchParams({
    '_token': session.csrfToken,
    'order_establishment': parsed.est,
    'order_casetype': parsed.typeCode,
    'order_reg_no': parsed.regNo,
    'order_year': parsed.year,
    'captcha': cleanCaptcha
  }).toString();

  const searchRes = await fetch(`${BASE_URL}/order_judgment_search`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Referer': `${BASE_URL}/highcourt_order_search`,
      'Cookie': session.cookieHeader,
      'X-CSRF-TOKEN': session.csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: formBody
  });

  const resText = await searchRes.text();
  let resObj = null;
  try {
    resObj = JSON.parse(resText);
    if (typeof resObj === 'string') resObj = JSON.parse(resObj);
  } catch (e) {}

  const listHtml = resObj?.list || resText;

  // 1. Invalid captcha check
  if (listHtml.includes('Invalid Captcha') || listHtml.includes('invalid captcha')) {
    const freshSession = await createCalcuttaHighCourtSession();
    return {
      success: false,
      isCaptchaError: true,
      newSessionId: freshSession.sessionId,
      newCaptchaDataUrl: freshSession.captchaDataUrl,
      error: 'Calcutta High Court reported: Invalid Captcha. A fresh court captcha has been generated. Please try again.'
    };
  }

  // 2. Case not found in registry
  if (!resObj?.cino || resObj?.cino === 0) {
    if (listHtml.toLowerCase().includes('not found')) {
      return {
        success: true,
        found: false,
        courtType: 'CALCUTTA_HIGH_COURT',
        caseNumber: `${parsed.typeLabel}/${parsed.regNo}/${parsed.year}`,
        message: `Connected to Calcutta High Court portal. Case ${parsed.typeLabel}/${parsed.regNo}/${parsed.year} is not yet registered or indexed in court database.`
      };
    }
  }

  // 3. No orders yet
  const causeTitle = (resObj?.cause_title || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (listHtml.includes('No Order/Judgement Found')) {
    return {
      success: true,
      found: true,
      courtType: 'CALCUTTA_HIGH_COURT',
      cino: resObj?.cino,
      caseNumber: `${parsed.typeLabel}/${parsed.regNo}/${parsed.year}`,
      causeTitle,
      message: `Verified case ${parsed.typeLabel}/${parsed.regNo}/${parsed.year} (CINO: ${resObj?.cino}) in Calcutta High Court database. Cause: "${causeTitle}". Signed judicial orders pending upload by registry.`,
      orders: []
    };
  }

  // 4. Parse orders table
  const orders = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rMatch;

  while ((rMatch = rowRegex.exec(listHtml)) !== null) {
    const rowHtml = rMatch[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let cMatch;
    while ((cMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cMatch[1].replace(/<[^>]*>/g, '').trim());
    }

    if (cells.length < 4) continue;

    const dataMatch = rowHtml.match(/show_order\(["']([^"']+)["']\)/i);
    const orderData = dataMatch ? dataMatch[1] : '';

    const orderNumber = cells[0] || (orders.length + 1).toString();
    const orderDate = cells[1] || '';
    const coram = cells[2] || '';
    const orderType = cells[3] || 'Order';

    let pdfBuffer = null;
    let pdfUrl = null;

    if (orderData) {
      try {
        const pdfReqBody = new URLSearchParams({
          'order_data': orderData,
          '_token': session.csrfToken
        }).toString();

        const pdfReqRes = await fetch(`${BASE_URL}/show_pdf`, {
          method: 'POST',
          headers: {
            'User-Agent': UA,
            'Referer': `${BASE_URL}/highcourt_order_search`,
            'Cookie': session.cookieHeader,
            'X-CSRF-TOKEN': session.csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: pdfReqBody
        });

        const directLink = (await pdfReqRes.text()).trim();
        if (directLink.startsWith('http')) {
          pdfUrl = directLink;
          const dl = await fetch(directLink, { headers: { 'User-Agent': UA } });
          if (dl.ok) {
            pdfBuffer = Buffer.from(await dl.arrayBuffer());
          }
        }
      } catch (dlErr) {
        console.warn(`[Calcutta HC] Failed to fetch PDF for order ${orderNumber}:`, dlErr.message);
      }
    }

    orders.push({
      orderNumber,
      orderDate,
      coram,
      orderSummary: `${coram} - ${orderType}`.trim(' -'),
      pdfBuffer,
      pdfUrl,
      fileSize: pdfBuffer ? pdfBuffer.length : 0
    });
  }

  return {
    success: true,
    found: true,
    courtType: 'CALCUTTA_HIGH_COURT',
    cino: resObj?.cino,
    caseNumber: `${parsed.typeLabel}/${parsed.regNo}/${parsed.year}`,
    causeTitle,
    orders,
    ordersCount: orders.length,
    message: `Connected to Calcutta High Court portal. Retrieved ${orders.length} signed orders for CINO ${resObj?.cino}.`
  };
}

/**
 * 100% Autonomous Zero-Interference Query for Calcutta High Court
 * Executes Python deep-learning solver script (ddddocr)
 */
function queryCalcuttaHighCourtAuto({
  caseNumber = '',
  caseType = '',
  cnrNumber = '',
  courtCode = '',
  courtName = '',
  targetOutputDir = null
} = {}) {
  return new Promise((resolve) => {
    const cleanCaseNo = (caseNumber || 'CAL_HC_CASE').replace(/[^a-zA-Z0-9_-]/g, '_');
    const outDir = targetOutputDir || path.join(__dirname, '..', 'storage', 'autofetched_orders', cleanCaseNo);
    const scriptPath = path.join(__dirname, '..', 'scripts', 'calcutta_high_court_fetch.py');

    const args = [
      scriptPath,
      '--case-number', caseNumber,
      '--case-type', caseType,
      '--cnr', cnrNumber,
      '--court-code', courtCode,
      '--court-name', courtName,
      '--output-dir', outDir,
      '--max-retries', '6'
    ];

    console.log(`[Calcutta High Court Sync] Invoking autonomous order fetcher for: ${caseNumber} (${courtCode})...`);

    execFile('python3', args, { timeout: 120000, maxBuffer: 25 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (stdout && stdout.trim()) {
        try {
          const result = JSON.parse(stdout.trim());
          return resolve(result);
        } catch (parseErr) {
          console.warn('[Calcutta High Court Sync] Failed to parse stdout as JSON:', parseErr.message, stdout);
        }
      }

      if (err) {
        console.error('[Calcutta High Court Sync] Execution error:', err.message, stderr);
        return resolve({
          success: false,
          error: `Calcutta High Court automated sync error: ${err.message}`
        });
      }

      return resolve({
        success: false,
        error: 'No output received from Calcutta High Court fetcher.'
      });
    });
  });
}

module.exports = {
  isCalcuttaHighCourtCase,
  parseCaseParams,
  createCalcuttaHighCourtSession,
  submitCalcuttaHighCourtWithCaptcha,
  queryCalcuttaHighCourtAuto
};
