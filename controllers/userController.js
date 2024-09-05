const admin = require('firebase-admin');
const db = admin.database();

// Update user controller
const updateUser = (req, res) => {
  const { username } = req.body;
  const userRef = db.ref('users/' + req.user.uid);

  userRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'User not found.' });
    }

    userRef.update({ username }, () => {
      res.json({ message: 'User updated successfully!' });
    });
  });
};

// Get user controller
const getUser = (req, res) => {
  const userRef = db.ref('users/' + req.user.uid);

  userRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = snapshot.val();
    res.json({ uid: user.uid, username: user.username, role: user.role });
  });
};

module.exports = { updateUser, getUser };
