const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// استخدم body-parser لتحليل البيانات
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// التعامل مع جميع أنواع الطلبات على جميع المسارات
app.all('*', async (req, res) => {
  console.log("yes !")
  try {
    // تحويل الطلب إلى السيرفر الآخر كطلب POST مع جسم الطلب بصيغة JSON
    const response = await axios.post('https://cloud.uibakery.io/api/automation/crBedHcHAk/dev?key=2df3d581-2e8b-4ba2-b63a-b69e41f58d03', {
      method: req.method, // نوع الطلب
      url: req.url, // المسار
      headers: req.headers, // نقل كل الرؤوس
      data: req.body // نقل جسم الطلب بصيغة JSON
    }, {
      headers: { 'Content-Type': 'application/json' } // تحديد نوع المحتوى كـ JSON
    });

    // إرسال استجابة الخادم الآخر إلى العميل
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding the request:', error);
    res.status(500).json({ message: 'Failed to forward the request' });
  }
});

// بدء الخادم
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
