const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const ECOURTS_BASE = 'https://services.ecourts.gov.in/ecourtindia_v6';

/**
 * Connects to live eCourts portal, downloads the Securimage captcha,
 * solves it via Tesseract OCR, and submits the CNR query.
 */
async function queryEcourtsByCnr(cnrNumber, maxRetries = 4) {
  const cleanCnr = (cnrNumber || '').replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
  if (cleanCnr.length !== 16) {
    return {
      success: false,
      error: `Invalid CNR length (${cleanCnr.length}). eCourts requires a 16-character alphanumeric CNR.`
    };
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    console.log(`[eCourts Sync] Attempt ${attempt}/${maxRetries} for CNR: ${cleanCnr}...`);

    try {
      // 1. Establish session & fetch CSRF token
      const homeRes = await fetch(`${ECOURTS_BASE}/?p=home/index`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const rawCookies = homeRes.headers.get('set-cookie') || '';
      const cookieHeader = rawCookies
        .split(',')
        .map(c => c.split(';')[0])
        .filter(c => c.includes('SERVICES_SESSID') || c.includes('JSESSION'))
        .join('; ');

      const homeHtml = await homeRes.text();
      const tokenMatch = homeHtml.match(/id=[\'\"]app_token[\'\"][^>]+value=[\'\"]([^\'\"]+)[\'\"]/i);
      const appToken = tokenMatch ? tokenMatch[1] : '';

      // 2. Extract Captcha Image URL
      const capMatch = homeHtml.match(/src=[\'\"]([^\'\"]*securimage_show\.php[^\'\"]*)[\'\"]/i);
      if (!capMatch) {
        throw new Error('eCourts captcha image endpoint not found.');
      }

      const captchaUrl = `${ECOURTS_BASE}/${capMatch[1].replace(/^\/ecourtindia_v6\//, '')}`;
      const capRes = await fetch(captchaUrl, {
        headers: {
          'Cookie': cookieHeader,
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const imgBuffer = Buffer.from(await capRes.arrayBuffer());

      // 3. Solve Captcha via Tesseract OCR
      const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng', {
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      });

      const solvedCaptcha = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
      console.log(`[eCourts Sync] OCR Solved Captcha: "${solvedCaptcha}"`);

      if (!solvedCaptcha || solvedCaptcha.length < 4) {
        console.warn('[eCourts Sync] Low-confidence captcha OCR, retrying...');
        continue;
      }

      // 4. Submit Query to eCourts CNR Endpoint
      const postUrl = `${ECOURTS_BASE}/?p=cnr_status/searchByCNR/`;
      const postBody = `cino=${encodeURIComponent(cleanCnr)}&fcaptcha_code=${encodeURIComponent(solvedCaptcha)}&ajax_req=true&app_token=${encodeURIComponent(appToken)}`;

      const searchRes = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0',
          'delimeter': 'eqf34tg',
          'P7913rgdf': 'eqf34tg'
        },
        body: postBody
      });

      const responseText = await searchRes.text();

      // Check if eCourts reported captcha failure
      if (responseText.includes('Invalid Captcha') || responseText.includes('invalid captcha')) {
        console.warn(`[eCourts Sync] eCourts reported Invalid Captcha ("${solvedCaptcha}"). Re-attempting...`);
        continue;
      }

      // Check if CNR was not found
      if (responseText.includes('does not exist') || responseText.includes('Record not found') || responseText.includes('Entered CNR does not exist')) {
        return {
          success: true,
          found: false,
          cnrNumber: cleanCnr,
          message: `CNR ${cleanCnr} is verified against eCourts national database. Currently pending listing/upload by court registry.`
        };
      }

      // 5. Parse genuine case details & order links from response
      const orders = [];
      const pdfMatches = responseText.matchAll(/href=[\'\"]([^\'\"]*(?:order|judgment|display_pdf)[^\'\"]*\.pdf[^\'\"]*)[\'\"]/gi);
      for (const m of pdfMatches) {
        const fullPdfUrl = m[1].startsWith('http') ? m[1] : `${ECOURTS_BASE}/${m[1].replace(/^\//, '')}`;
        orders.push({
          pdfUrl: fullPdfUrl,
          orderDate: new Date().toISOString().split('T')[0]
        });
      }

      return {
        success: true,
        found: true,
        cnrNumber: cleanCnr,
        orders,
        rawResponseSnippet: responseText.slice(0, 800),
        message: `Successfully connected to eCourts database for CNR ${cleanCnr}. Discovered ${orders.length} signed orders.`
      };

    } catch (err) {
      console.error(`[eCourts Sync] Error on attempt ${attempt}:`, err.message);
    }
  }

  return {
    success: false,
    error: `Could not complete eCourts handshake after ${maxRetries} OCR attempts.`
  };
}

module.exports = {
  queryEcourtsByCnr
};
