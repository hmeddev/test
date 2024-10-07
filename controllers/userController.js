const admin = require('../firebase/firebase');
const { createErrorResponse, createSuccessResponse, main } = require('../lib/Handler');
const ERROR_CODES = require('../lib/ERROR_CODES');
const db = admin.database();
const path = main().path;

// Update user controller
const updateUser = (req, res) => {
  const { username } = req.body;
  const userRef = db.ref(path + '/users/' + req.user.uid);

  userRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      // استخدام createErrorResponse مع رمز الخطأ الجديد
      return res.status(404).json(createErrorResponse(ERROR_CODES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND.message));
    }

    userRef.update({ username }, (error) => {
      if (error) {
        // إذا حدث خطأ أثناء التحديث
        return res.status(500).json(createErrorResponse(ERROR_CODES.FAILED_TO_UPDATE_USER, ERROR_CODES.FAILED_TO_UPDATE_USER.message));
      }
      // استخدام createSuccessResponse للرد عند النجاح
      res.json(createSuccessResponse({}, 'User updated successfully!'));
    });
  });
};

// Get user controller
const getUser = (req, res) => {
  const userRef = db.ref(path + '/users/' + req.user.uid);

  userRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      // استخدام createErrorResponse مع رمز الخطأ الجديد
      return res.status(404).json(createErrorResponse(ERROR_CODES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND.message));
    }

    const user = snapshot.val();
    // استخدام createSuccessResponse للرد عند النجاح
    res.json(createSuccessResponse({
      uid: user.uid,
      username: user.username,
      nickname: user.nickname,
      coin: 1000000
    }, 'User fetched successfully!'));
  });
};

module.exports = { updateUser, getUser };
