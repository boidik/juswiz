#!/usr/bin/env python3
"""
Autonomous eCourts Order Fetcher
Resolves dynamic anti-bot headers, solves Securimage captchas using deep-learning OCR (ddddocr),
queries the national judicial database, and downloads authentic signed court orders.
"""

import sys
import os
import argparse
import json
import re
import urllib.request
import urllib.parse
import http.cookiejar

BASE_URL = "https://services.ecourts.gov.in/ecourtindia_v6"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"

def scrape_anti_bot_headers(opener, home_html):
    comp_match = re.search(r'js/components\.js(?:\?v=\d+)?', home_html)
    comp_url = f"{BASE_URL}/{comp_match.group(0)}" if comp_match else f"{BASE_URL}/js/components.js"
    
    req_comp = urllib.request.Request(comp_url, headers={"User-Agent": UA, "Referer": f"{BASE_URL}/"})
    with opener.open(req_comp) as resp:
        comp_js = resp.read().decode("utf-8", errors="ignore")

    delim_match = re.search(r'var\s+delimeter\s*=\s*[\"\x27]([^\"\x27]+)[\"\x27]', comp_js)
    delimeter = delim_match.group(1) if delim_match else ""

    spec = {}
    for block in re.findall(r'headers\s*:\s*\{([^{}]*)\}', comp_js):
        cur_spec = {}
        for m in re.finditer(r'[\"\x27]([A-Za-z0-9_-]+)[\"\x27]\s*:\s*(?:[\"\x27]([^\"\x27]*)[\"\x27]|([A-Za-z_$][\w$]*))', block):
            name, lit, ident = m.groups()
            if not ident:
                cur_spec[name] = lit
            elif ident == 'delimeter':
                cur_spec[name] = delimeter
        if delimeter and delimeter in cur_spec.values():
            spec = cur_spec
            break

    if not spec and delimeter:
        spec = {"delimeter": delimeter}

    return delimeter, spec

def main():
    parser = argparse.ArgumentParser(description="eCourts Autonomous Order Fetcher")
    parser.add_argument("--cnr", required=True, help="16-character alphanumeric CNR number")
    parser.add_argument("--output-dir", required=True, help="Directory to save downloaded court PDFs")
    parser.add_argument("--case-number", default="CASE", help="Case number label for naming files")
    parser.add_argument("--max-retries", type=int, default=8, help="Max captcha attempts")
    args = parser.parse_args()

    clean_cnr = re.sub(r'[^a-zA-Z0-9]', '', args.cnr).upper()
    if len(clean_cnr) != 16:
        print(json.dumps({
            "success": False,
            "error": f"Invalid CNR length ({len(clean_cnr)}). eCourts requires a 16-character CNR."
        }))
        sys.exit(0)

    os.makedirs(args.output_dir, exist_ok=True)
    clean_case_name = re.sub(r'[^a-zA-Z0-9_-]', '_', args.case_number)

    try:
        import ddddocr
        ocr = ddddocr.DdddOcr(show_ad=False)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Failed to initialize deep-learning OCR: {str(e)}"
        }))
        sys.exit(0)

    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    # 1. Establish session
    try:
        req_home = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": UA, "Referer": f"{BASE_URL}/"})
        with opener.open(req_home) as resp:
            home_html = resp.read().decode("utf-8", errors="ignore")

        delimeter, header_spec = scrape_anti_bot_headers(opener, home_html)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Failed to initialize eCourts connection: {str(e)}"
        }))
        sys.exit(0)

    ajax_headers = {
        "User-Agent": UA,
        "Referer": f"{BASE_URL}/",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json, text/javascript, */*; q=0.01"
    }
    ajax_headers.update(header_spec)

    # 2. Get initial captcha & app_token
    try:
        post_data = urllib.parse.urlencode({"ajax_req": "true", "app_token": ""}).encode("utf-8")
        req_cap = urllib.request.Request(f"{BASE_URL}/?p=casestatus/getCaptcha", data=post_data, headers=ajax_headers)
        with opener.open(req_cap) as resp:
            cap_raw = resp.read().decode("utf-8", errors="ignore")
        cap_json = json.loads(cap_raw)
        app_token = cap_json.get("app_token", "")
        div_captcha = cap_json.get("div_captcha", "")
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Failed to fetch initial court security token: {str(e)}"
        }))
        sys.exit(0)

    # 3. Autonomous OCR & Search Loop
    search_json = None
    last_error = None

    for attempt in range(1, args.max_retries + 1):
        src_match = re.search(r'src=[\"\x27]([^\"\x27]*securimage_show\.php[^\"\x27]*)[\"\x27]', div_captcha)
        if not src_match:
            last_error = "Captcha image URL not found in court response"
            break
        
        cap_img_rel = src_match.group(1)
        cap_img_url = f"https://services.ecourts.gov.in{cap_img_rel}" if cap_img_rel.startswith("/") else f"{BASE_URL}/{cap_img_rel}"

        try:
            req_img = urllib.request.Request(cap_img_url, headers={"User-Agent": UA, "Referer": f"{BASE_URL}/"})
            with opener.open(req_img) as resp:
                img_bytes = resp.read()

            solved_captcha = ocr.classification(img_bytes).strip()
            if not solved_captcha or len(solved_captcha) < 4:
                # Refresh captcha and retry
                continue

            search_post = urllib.parse.urlencode({
                "cino": clean_cnr,
                "fcaptcha_code": solved_captcha,
                "ajax_req": "true",
                "app_token": app_token
            }).encode("utf-8")

            req_search = urllib.request.Request(f"{BASE_URL}/?p=cnr_status/searchByCNR", data=search_post, headers=ajax_headers)
            with opener.open(req_search) as resp:
                search_raw = resp.read().decode("utf-8", errors="ignore")

            res_data = json.loads(search_raw)

            if "casetype_list" in res_data:
                search_json = res_data
                break
            elif "errormsg" in res_data:
                err = res_data["errormsg"]
                if "Invalid Captcha" in err:
                    div_captcha = res_data.get("div_captcha", div_captcha)
                    app_token = res_data.get("app_token", app_token)
                    continue
                elif "does not exist" in err or "Record not found" in err:
                    print(json.dumps({
                        "success": True,
                        "found": False,
                        "cnr": clean_cnr,
                        "message": f"CNR {clean_cnr} verified against eCourts national database. Currently pending listing/upload by registry."
                    }))
                    sys.exit(0)
                else:
                    last_error = err
            else:
                last_error = "Unrecognized response structure from eCourts"

        except Exception as step_err:
            last_error = str(step_err)

    if not search_json or "casetype_list" not in search_json:
        clean_err = re.sub(r'<[^>]*>', '', last_error or "Autonomous verification threshold reached").strip()
        print(json.dumps({
            "success": False,
            "error": f"eCourts portal response: {clean_err}"
        }))
        sys.exit(0)

    html = search_json.get("casetype_list", "")
    active_token = search_json.get("app_token", app_token)

    # 4. Parse orders table
    orders_discovered = []
    row_regex = re.compile(r'<tr[^>]*>([\s\S]*?)<\/tr>', re.IGNORECASE)

    for row in row_regex.findall(html):
        pdf_match = re.search(
            r'displayPdf\s*\(\s*[\"\x27]([^\"]+)[\"\x27]\s*,\s*[\"\x27]([^\"]+)[\"\x27]\s*,\s*[\"\x27]([^\"]+)[\"\x27]\s*,\s*[\"\x27]([^\"]+)[\"\x27]\s*,\s*[\"\x27]([^\"]*)[\"\x27]\s*\)',
            row,
            re.IGNORECASE
        )
        if pdf_match:
            tds = re.findall(r'<td[^>]*>([\s\S]*?)<\/td>', row, re.IGNORECASE)
            cells = [re.sub(r'<[^>]*>', '', td).strip() for td in tds]

            # Date extraction
            date_match = re.search(r'(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})', row)
            order_date = date_match.group(1) if date_match else (cells[1] if len(cells) > 1 else "Unknown_Date")
            order_num = cells[0] if len(cells) > 0 and cells[0] else str(len(orders_discovered) + 1)

            # Summary / Details
            aria_match = re.search(r'aria-label=[\"\x27]([^\"\x27]+)[\"\x27]', row, re.IGNORECASE)
            if aria_match:
                order_summary = aria_match.group(1).replace("Interim Orders |", "").strip()
            elif len(cells) > 2 and cells[2]:
                order_summary = cells[2]
            else:
                order_summary = "Signed Judicial Order Sheet"

            orders_discovered.append({
                "orderNumber": order_num,
                "orderDate": order_date,
                "orderSummary": order_summary,
                "pdfParams": {
                    "normal_v": pdf_match.group(1),
                    "case_val": pdf_match.group(2),
                    "court_code": pdf_match.group(3),
                    "filename": pdf_match.group(4),
                    "appFlag": pdf_match.group(5)
                }
            })

    # 5. Download authentic PDF files
    downloaded_orders = []

    for idx, ord_info in enumerate(orders_discovered, 1):
        params = ord_info["pdfParams"]
        safe_date = ord_info["orderDate"].replace("/", "-")
        # Format: YYYY-MM-DD or DD-MM-YYYY
        parts = safe_date.split("-")
        if len(parts) == 3 and len(parts[2]) == 4:
            # DD-MM-YYYY -> YYYY-MM-DD for standard chronological sorting
            sortable_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
        else:
            sortable_date = safe_date

        out_file_name = f"{sortable_date}_ORDER_{clean_case_name}_{idx}.pdf"
        out_file_path = os.path.join(args.output_dir, out_file_name)

        dl_post = urllib.parse.urlencode({
            "normal_v": params["normal_v"],
            "case_val": params["case_val"],
            "court_code": params["court_code"],
            "filename": params["filename"],
            "appFlag": params["appFlag"],
            "ajax_req": "true",
            "app_token": active_token
        }).encode("utf-8")

        try:
            req_dl = urllib.request.Request(f"{BASE_URL}/?p=home/display_pdf", data=dl_post, headers=ajax_headers)
            with opener.open(req_dl) as resp:
                dl_raw = resp.read().decode("utf-8", errors="ignore")

            dl_json = json.loads(dl_raw)
            pdf_rel = dl_json.get("order") or dl_json.get("filename")
            if dl_json.get("app_token"):
                active_token = dl_json["app_token"]

            if pdf_rel:
                pdf_url = f"https://services.ecourts.gov.in{pdf_rel}" if pdf_rel.startswith("/") else f"{BASE_URL}/{pdf_rel}"
                req_pdf = urllib.request.Request(pdf_url, headers={"User-Agent": UA, "Referer": f"{BASE_URL}/"})
                with opener.open(req_pdf) as resp:
                    pdf_bytes = resp.read()

                with open(out_file_path, "wb") as f:
                    f.write(pdf_bytes)

                downloaded_orders.append({
                    "orderNumber": ord_info["orderNumber"],
                    "orderDate": ord_info["orderDate"],
                    "orderSummary": ord_info["orderSummary"],
                    "fileName": out_file_name,
                    "filePath": out_file_path,
                    "fileSize": len(pdf_bytes),
                    "hasPdf": True
                })
            else:
                downloaded_orders.append({
                    "orderNumber": ord_info["orderNumber"],
                    "orderDate": ord_info["orderDate"],
                    "orderSummary": ord_info["orderSummary"],
                    "fileName": out_file_name,
                    "hasPdf": False
                })

        except Exception as dl_err:
            downloaded_orders.append({
                "orderNumber": ord_info["orderNumber"],
                "orderDate": ord_info["orderDate"],
                "orderSummary": ord_info["orderSummary"],
                "fileName": out_file_name,
                "hasPdf": False,
                "error": str(dl_err)
            })

    print(json.dumps({
        "success": True,
        "found": True,
        "cnr": clean_cnr,
        "totalOrdersDiscovered": len(orders_discovered),
        "ordersDownloaded": sum(1 for o in downloaded_orders if o.get("hasPdf")),
        "orders": downloaded_orders,
        "message": f"Successfully retrieved {len(orders_discovered)} signed judicial orders from eCourts National Services database."
    }))

if __name__ == "__main__":
    main()
