const admin = require('../firebase');
const db = admin.database();


// Get games controller
const getgames = (req, res) => {
  const gamesRef = db.ref('games/');

  gamesRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json({status:false, error: 'games not found.' });
    }

    const games = snapshot.val();
    res.json({status:true, title:games.title,description:games.description,img:games.img,key:games.key });
  });
};

module.exports = { getgames };
