const admin = require('../firebase');
const db = admin.database();

// Get games controller
const getgames = (req, res) => {
  console.log("games");
  const gamesRef = db.ref('games/');

  gamesRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json({status: false, error: 'games not found.'});
    }

    const games = snapshot.val();
    
    // تحويل البيانات إلى مصفوفة إذا لم تكن مصفوفة
    const gamesArray = Array.isArray(games) ? games : [games];
    
    // إضافة تسلسل لكل لعبة
    const gamesResponse = gamesArray.map((game, index) => ({
      title: game.title || 'No title',
      description: game.description || 'No description',
      img: game.img || 'No image',
      key: game.key || 'No key',
      index: index + 1
    }));

    res.json({status: true, games: gamesResponse});
  });
};

module.exports = { getgames };
