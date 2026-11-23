import os, hmac, time, secrets, hashlib, threading, random, string
from datetime import datetime, timedelta, timezone
from urllib.parse import quote
import requests
from flask import Flask, jsonify, request, session, send_from_directory

ROOT = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)
app.secret_key = os.getenv("SESSION_SECRET", "")
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SECURE=os.getenv("COOKIE_SECURE","true").lower()=="true", SESSION_COOKIE_SAMESITE="Strict", PERMANENT_SESSION_LIFETIME=timedelta(hours=2), MAX_CONTENT_LENGTH=16384)
PROXY_URL = os.getenv("PROXY_URL","").rstrip("/")
ACCESS_KEY = os.getenv("ACCESS_KEY","")
PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH","")
LOCK = threading.Lock()
ATTEMPTS = {}
MAX_SECONDS = 31536000
ALLOWED_DEVICES = {1,2,3,5}

def auth_ready():
    return len(app.secret_key) >= 32 and bool(PASSWORD_HASH)

def backend_ready():
    return bool(PROXY_URL and ACCESS_KEY)

def logged_in():
    return session.get("admin") is True

def csrf_ok():
    token = request.headers.get("X-CSRF-Token","")
    expected = session.get("csrf","")
    return bool(token and expected and hmac.compare_digest(token,expected))

def verify_password(value):
    try:
        alg,n,r,p,salt,digest = PASSWORD_HASH.split("$")
        if alg != "scrypt": return False
        actual = hashlib.scrypt(value.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p), dklen=len(bytes.fromhex(digest)), maxmem=128*1024*1024)
        return hmac.compare_digest(actual,bytes.fromhex(digest))
    except (ValueError,TypeError,MemoryError): return False

def limited(name,limit,window):
    now=time.time(); ip=request.headers.get("X-Forwarded-For",request.remote_addr or "unknown").split(",")[0].strip()
    key=name+":"+ip
    with LOCK:
        hits=[t for t in ATTEMPTS.get(key,[]) if now-t<window]
        if len(hits)>=limit: ATTEMPTS[key]=hits; return True
        hits.append(now); ATTEMPTS[key]=hits
    return False

def url_for_key(key=None):
    return PROXY_URL + ("/keys/"+quote(key,safe="")+".json" if key else "/keys.json")

def headers():
    return {"X-Access-Key":ACCESS_KEY,"Content-Type":"application/json"}

def proxy_put(url,data):
    h=headers(); h["X-HTTP-Method-Override"]="PUT"
    r=requests.post(url,headers=h,json=data,timeout=15,verify=False)
    if r.status_code!=200: raise RuntimeError("رفض السيرفر حفظ المفتاح (HTTP %s): %s"%(r.status_code,r.text[:200]))

def label(seconds):
    units=[(86400,"يوم"),(3600,"ساعة"),(60,"دقيقة"),(1,"ثانية")]
    out=[]; left=seconds
    for size,name in units:
        count,left=divmod(left,size)
        if count: out.append("%s %s"%(count,name))
    return " و".join(out) or "0 ثانية"

def make_key():
    chars = string.ascii_uppercase + string.digits
    key = "DEVIL"
    for _ in range(3):
        key += "-" + "".join(random.choices(chars, k=4))
    return key

@app.after_request
def secure_headers(response):
    response.headers["X-Content-Type-Options"]="nosniff"
    response.headers["X-Frame-Options"]="DENY"
    response.headers["Referrer-Policy"]="strict-origin-when-cross-origin"
    response.headers["Cache-Control"]="no-store"
    response.headers["Permissions-Policy"]="camera=(), microphone=(), geolocation=()"
    return response

@app.get("/")
def index(): return send_from_directory(ROOT,"index.html",max_age=0)

@app.get("/health")
def health(): return jsonify(ok=True,service="NACER_FAKE_DEVEL")

@app.get("/api/session")
def session_status():
    return jsonify(authenticated=logged_in(),csrfToken=session.get("csrf","") if logged_in() else "")

@app.post("/api/login")
def login():
    if not auth_ready(): return jsonify(error="إعدادات تسجيل الدخول غير مكتملة على Railway."),503
    if limited("login",6,600): return jsonify(error="محاولات كثيرة. انتظر عشر دقائق ثم حاول."),429
    data=request.get_json(silent=True) or {}; password=str(data.get("password",""))
    if len(password)>256 or not verify_password(password): return jsonify(error="رمز الدخول غير صحيح."),401
    session.clear(); session.permanent=True; session["admin"]=True; session["csrf"]=secrets.token_urlsafe(32)
    return jsonify(ok=True,csrfToken=session["csrf"])

@app.post("/api/logout")
def logout():
    if not logged_in() or not csrf_ok(): return jsonify(error="جلسة غير صالحة."),401
    session.clear(); return jsonify(ok=True)

@app.post("/api/create-keys")
def create_keys():
    if not logged_in() or not csrf_ok(): return jsonify(error="انتهت الجلسة. سجّل الدخول مجدداً."),401
    if not backend_ready(): return jsonify(error="إعدادات اتصال قاعدة المفاتيح غير مكتملة."),503
    if limited("create",12,60): return jsonify(error="تجاوزت عدد العمليات المسموح. حاول بعد دقيقة."),429
    data=request.get_json(silent=True) or {}
    try:
        duration=int(data.get("durationSeconds",0))
        quantity=int(data.get("quantity",1))
        username=str(data.get("username","User")).strip()[:80] or "User"
    except (ValueError,TypeError):
        return jsonify(error="قيم الطلب غير صحيحة."),400
    if not 1<=duration<=MAX_SECONDS: return jsonify(error="المدة يجب أن تكون بين ثانية واحدة وسنة."),400
    if not 1<=quantity<=20: return jsonify(error="عدد المفاتيح يجب أن يكون بين 1 و20."),400
    created=[]
    try:
        for _ in range(quantity):
            key=make_key()
            now=int(time.time())
            expiry=(datetime.utcnow()+timedelta(seconds=duration)).strftime("%Y-%m-%d")
            key_data={
                "device_id":None,
                "device_ids":[],
                "max_devices":1,
                "activated_at":0,
                "active":True,
                "expiry":duration,
                "created_by":"BOT",
                "created_at":now,
                "Banned":False,
                "DeviceLimit":1,
                "Devices":{"dummy":0},
                "ExpiryDate":expiry,
                "Username":username,
            }
            proxy_put(url_for_key(key),key_data)
            created.append({
                "key":key,
                "durationLabel":label(duration),
                "durationSeconds":duration,
                "deviceLimit":1,
                "expiryDate":expiry,
                "createdAt":now,
                "active":True,
                "banned":False
            })
        return jsonify(ok=True,keys=created,count=len(created))
    except (requests.RequestException,RuntimeError) as e:
        return jsonify(error=str(e) if isinstance(e,RuntimeError) else "تعذر الاتصال بالسيرفر الأصلي.",created=created),502

if __name__=="__main__":
    app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")),debug=False)
