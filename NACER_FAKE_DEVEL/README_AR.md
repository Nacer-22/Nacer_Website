# NACER_FAKE_DEVEL

لوحة عربية لتوليد مفاتيح الاشتراك، مع واجهة سوداء وحمراء وتسجيل دخول محمي.

## التشغيل على Railway

- Root Directory: `/NACER_FAKE_DEVEL`
- Build command: اتركه فارغاً (Railpack يقرأ requirements.txt)
- Start command: `gunicorn --workers 2 --threads 4 --bind 0.0.0.0:$PORT server:app`
- Healthcheck path: `/health`

## متغيرات البيئة الخاصة

أضف في Railway > Service > Variables:

- `SESSION_SECRET`: قيمة عشوائية طويلة لا تقل عن 32 حرفاً.
- `ADMIN_PASSWORD_HASH`: تجزئة scrypt لرمز الدخول، لا تضع الرمز الأصلي هنا.
- `PROXY_URL`: رابط بوابة Val Town المصرح لك بها.
- `ACCESS_KEY`: مفتاح وصول جديد بعد تدوير المفتاح الذي ظهر سابقاً في مستودع عام.
- `COOKIE_SECURE=true`

لا تضع الأسرار في GitHub أو في `index.html`. لا يمكن إنشاء مفاتيح فعلية حتى يتم إعداد `PROXY_URL` و`ACCESS_KEY` الصحيحين. يستخدم الخادم مسار `keys/` وطريقة PUT عبر `X-HTTP-Method-Override` كما في بوابة البوت.

## الحماية

تجزئة كلمة المرور باستخدام scrypt، جلسات HttpOnly وSameSite=Strict، CSRF للطلبات المعدلة، وتحديد محاولات تسجيل الدخول وإنشاء المفاتيح.
