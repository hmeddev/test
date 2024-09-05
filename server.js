// استيراد مكتبة Express
const express = require('express');

// إنشاء تطبيق Express
const app = express();

// تعيين المنفذ الذي سيعمل عليه الخادم
const PORT = 3000;

// إنشاء راوت بسيط للصفحة الرئيسية
app.get('/', (req, res) => {
    res.send('مرحبًا بك في خادم Express!');
});


app.get('Create-account', (req, res) => {
    res.send('Create an account');
});

// بدء تشغيل الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});
