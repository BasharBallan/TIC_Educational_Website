FROM node:22-alpine

# تحديد بيئة العمل للإنتاج
ENV NODE_ENV=production

WORKDIR /app

# نسخ ملفات الحزم أولاً للاستفادة من الـ Caching
COPY package*.json ./

# تثبيت حزم الإنتاج فقط بشكل أسرع وأكثر استقراراً
RUN npm ci --only=production

# نسخ باقي ملفات المشروع
COPY . .

# إنشاء مجلدات الرفع والسجلات وضبط صلاحيات المستخدم غير الجذر
RUN mkdir -p uploads logs && chown -R node:node /app

# استخدام مستخدم أمن بدلاً من root
USER node

EXPOSE 8000

CMD ["npm", "start"]
