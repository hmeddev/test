// gamesController.js

const admin = require('../firebase/firebase');
const { createErrorResponse, createSuccessResponse,main } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');
const db = admin.database();
const path = main().path;
const getitems = (req, res) => {
  console.log("Fetching items...");
  const gamesRef = db.ref(path+'/items/');

  gamesRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json(createErrorResponse(ERROR_CODES.GAMES_NOT_FOUND, ERROR_CODES.GAMES_NOT_FOUND.message));
    }

    const games = snapshot.val();
    
    // تحويل البيانات إلى مصفوفة إذا لم تكن مصفوفة
    const gamesArray = Array.isArray(games) ? games : Object.values(games);
    
    // إضافة تسلسل لكل لعبة
    const gamesResponse = gamesArray.map((game, index) => ({
      title: game.title || 'No title',
      description: game.description || 'No description',
      img: game.img || 'No image',
      key: game.key || 'No key',
      index: index + 1
    }));

    res.json(createSuccessResponse({ games: gamesResponse }, 'Games fetched successfully.'));
  });
}
  
  module.exports = { getitems };