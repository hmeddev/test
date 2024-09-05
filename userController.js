const Joi = require('joi');
const db = require('./firebase');

// تحديث بيانات المستخدم
const updateUserData = async (req, res) => {
    const { username } = req.body;
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const usersRef = db.ref('users');
    const userSnapshot = await usersRef.child(req.user.uid).once('value');
    
    if (!userSnapshot.exists()) return res.status(404).json({ error: 'المستخدم غير موجود.' });

    await usersRef.child(req.user.uid).update({ username });
    res.json({ message: 'تم تحديث البيانات بنجاح!' });
};

// قراءة بيانات المستخدم
const getUserData = async (req, res) => {
    const usersRef = db.ref('users');
    const userSnapshot = await usersRef.child(req.user.uid).once('value');
    
    if (!userSnapshot.exists()) return res.status(404).json({ error: 'المستخدم غير موجود.' });

    const user = userSnapshot.val();
    res.json({ uid: user.uid, username: user.username, role: user.role });
};

module.exports = { updateUserData, getUserData };
