const admin = require('../firebase');
const db = admin.database();


// Get games controller
const getgames = (req, res) => {
  console.log("games")
  const gamesRef = db.ref('games/');

  gamesRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json({status:false, error: 'games not found.' });
    }

    const games = snapshot.val();
    console.log({status:true, title:games.title,description:games.description,img:games.img,key:games.key })
    res.json({status:true, title:games.title,description:games.description,img:games.img,key:games.key });
  });
};

module.exports = { getgames };
