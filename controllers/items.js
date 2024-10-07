// itemsController.js

const admin = require('../firebase/firebase');
const { createErrorResponse, createSuccessResponse,main } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');
const db = admin.database();
const path = main().path;
const getitems = (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  console.log(ip)
  console.log("Fetching items...");
  const itemsRef = db.ref(path+'/items/');

  itemsRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json(createErrorResponse(ERROR_CODES.GAMES_NOT_FOUND, ERROR_CODES.GAMES_NOT_FOUND.message));
    }

    const items = snapshot.val();
    
    // تحويل البيانات إلى مصفوفة إذا لم تكن مصفوفة
    const itemsArray = Array.isArray(items) ? items : Object.values(items);
    
    // إضافة تسلسل لكل لعبة
    const itemsResponse = itemsArray.map((items, index) => ({
      name: items.name || 'No name',
      description: items.description || 'No description',
      icon: items.icon || 'No image',
      key: items.key || 'No key',
      group: items.group || 'No group',
      groupid: items.groupid || 'No groupid',
      id: items.id || 'No id',
      rarity: items.rarity || 'No rarity',
      time: items.time || 'No time',
      type: items.type || 'No type',
      index: index + 1
    }));

    res.json(createSuccessResponse({ items: itemsResponse }, 'items fetched successfully.'));
  });
}
  
  module.exports = { getitems };