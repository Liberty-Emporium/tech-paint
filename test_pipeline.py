#!/usr/bin/env python3
"""Full end-to-end pipeline test for TechPaint."""
import subprocess, json

BASE = "https://tech-paint-production.up.railway.app"
JAR = "/tmp/tp_test.txt"

def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

def curl(method, path, data=None, extra=""):
    url = f"{BASE}{path}"
    cmd = f"curl -s -c {JAR} -b {JAR} {extra}"
    if method == "POST":
        cmd += f" -X POST -H 'Content-Type: application/json' -d '{json.dumps(data)}'"
    elif method == "PATCH":
        cmd += f" -X PATCH -H 'Content-Type: application/json' -d '{json.dumps(data)}'"
    cmd += f" {url}"
    r = sh(cmd)
    try:
        return json.loads(r.stdout)
    except:
        return {"_raw": r.stdout[:500]}

# 1. Login
print("=" * 60)
print("1. LOGIN")
csrf = json.loads(sh(f"curl -s -c {JAR} -b {JAR} {BASE}/api/auth/csrf").stdout).get("csrfToken")
r = sh(f"""curl -s -c {JAR} -b {JAR} -X POST {BASE}/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken={csrf}" \
  --data-urlencode "email=admin@techpaint.com" \
  --data-urlencode "password=admin123" \
  --data-urlencode "json=true" -w '%{{http_code}}' -o /dev/null""")
print(f"   Credentials callback: HTTP {r.stdout.strip()}")

session = json.loads(sh(f"curl -s -c {JAR} -b {JAR} {BASE}/api/auth/session").stdout)
print(f"   Session: {json.dumps(session, indent=2)}")

# 2. Check nav bar in dashboard HTML
print("\n" + "=" * 60)
print("2. NAV BAR CHECK (dashboard HTML)")
html = sh(f"curl -s -c {JAR} -b {JAR} {BASE}/dashboard").stdout
has_nav = "TechPaint" in html and "Dashboard" in html and "Estimates" in html
print(f"   Nav renders: {has_nav}")
if has_nav:
    # Find nav-related content
    for marker in ["Dashboard", "Estimates", "Customers", "Documents", "Settings", "Sign In"]:
        if marker in html:
            print(f"   ✅ Nav link '{marker}' found")
        else:
            print(f"   ❌ Nav link '{marker}' MISSING")

# 3. Generate estimate
print("\n" + "=" * 60)
print("3. GENERATE ESTIMATE")
est = curl("POST", "/api/estimates/generate", {
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "customerPhone": "(336) 555-0123",
    "customerAddress": "123 Main St, Greensboro NC",
    "propertyDescription": "Interior painting for 3-bedroom house",
    "roomType": "interior",
    "squareFootage": "1500",
    "notes": "Prefer neutral colors, two coats"
})
print(f"   Response: {json.dumps(est, indent=2)}")
estimate_id = est.get("estimateId")

# 4. Fetch estimate detail
if estimate_id:
    print("\n" + "=" * 60)
    print("4. FETCH ESTIMATE DETAIL")
    detail = curl("GET", f"/api/estimates/{estimate_id}")
    print(f"   ID: {detail.get('id')}")
    print(f"   Number: {detail.get('estimateNumber')}")
    print(f"   Status: {detail.get('status')}")
    print(f"   Total: ${detail.get('total', 0):,.2f}")
    print(f"   Items: {len(detail.get('items', []))}")
    for item in detail.get("items", []):
        print(f"     - {item['description']}: ${item['total']:,.2f}")
    print(f"   Photos: {len(detail.get('photos', []))}")

# 5. Dashboard stats
print("\n" + "=" * 60)
print("5. DASHBOARD STATS")
stats = curl("GET", "/api/dashboard/stats")
print(f"   Stats: {json.dumps(stats, indent=2)}")

# 6. Estimates list
print("\n" + "=" * 60)
print("6. ESTIMATES LIST")
lst = curl("GET", "/api/estimates")
if isinstance(lst, list):
    print(f"   Count: {len(lst)}")
    for e in lst:
        print(f"   - {e.get('id','?')}: {e.get('customerName','?')} ${e.get('total',0):,.2f} [{e.get('status','?')}]")
else:
    print(f"   Response: {json.dumps(lst)}")

# 7. Email send (expect graceful failure without SMTP)
if estimate_id:
    print("\n" + "=" * 60)
    print("7. EMAIL SEND (send_estimate)")
    email_result = curl("POST", "/api/email", {
        "action": "send_estimate",
        "estimateId": estimate_id,
        "to": "jane@example.com",
        "estimate": est.get("estimate", {}),
    })
    print(f"   Result: {json.dumps(email_result, indent=2)}")

# 8. DocuSign
if estimate_id:
    print("\n" + "=" * 60)
    print("8. DOCUSIGN CREATE ENVELOPE")
    ds = curl("POST", "/api/docusign", {
        "action": "create_envelope",
        "estimateId": estimate_id,
        "customerEmail": "jane@example.com",
        "customerName": "Jane Smith",
    })
    print(f"   Result: {json.dumps(ds, indent=2)}")

# 9. Verify estimate status changed to 'sent' after docusign
if estimate_id:
    print("\n" + "=" * 60)
    print("9. ESTIMATE STATUS AFTER DOCUSIGN")
    detail2 = curl("GET", f"/api/estimates/{estimate_id}")
    print(f"   Status: {detail2.get('status')}")
    print(f"   EnvelopeId: {detail2.get('envelopeId', 'none')}")

print("\n" + "=" * 60)
print("PIPELINE TEST COMPLETE")
