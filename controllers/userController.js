const admin = require('../firebase/firebase');
const { createErrorResponse, createSuccessResponse, main } = require('../lib/Handler');
const db = admin.database();
const path = main().path;
// Update user controller
const updateUser = (req, res) => {
  const { username } = req.body;
  const userRef = db.ref(path+'/users/' + req.user.uid);

  userRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json({status:false, error: 'User not found.' });
    }

    userRef.update({ username }, () => {
      res.json({status:true, message: 'User updated successfully!' });
    });
  });
};

// Get user controller
const getUser = (req, res) => {
  const userRef = db.ref(path+'/users/' + req.user.uid);
console.log("user")
  userRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json({status:false, error: 'User not found.' });
      console.log("user-error")
    }

    const user = snapshot.val();
    res.json({status:true, uid: user.uid, username: user.username, role: user.role });
    console.log("user-done")
  });
};

module.exports = { updateUser, getUser };
