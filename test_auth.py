import subprocess, json, re

BASE = "https://tech-paint-production.up.railway.app"
JAR = "/tmp/tp_cookies.txt"

def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

# 1. Get CSRF token
r = sh(f"curl -s -c {JAR} -b {JAR} {BASE}/api/auth/csrf")
print("CSRF GET:", r.stdout[:200])
try:
    csrf = json.loads(r.stdout).get("csrfToken")
except Exception as e:
    csrf = None
    print("CSRF parse fail:", e)
print("csrfToken:", csrf)

# 2. Try credentials callback
r2 = sh(f"""curl -s -c {JAR} -b {JAR} -X POST {BASE}/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken={csrf}" \
  --data-urlencode "email=admin@techpaint.com" \
  --data-urlencode "password=admin123" \
  --data-urlencode "json=true" \
  -w "\\nHTTP %{{http_code}}" -o /tmp/tp_cb.txt""")
print("CALLBACK raw stdout:", r2.stdout)
print("CALLBACK stderr:", r2.stderr[:200])

# 3. Check session
r3 = sh(f"curl -s -c {JAR} -b {JAR} {BASE}/api/auth/session -w '\\nHTTP %{{http_code}}'")
print("SESSION:", r3.stdout)
