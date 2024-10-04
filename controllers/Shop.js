// ShopController.js

const admin = require('../firebase/firebase');
const { createErrorResponse, createSuccessResponse,main } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');
const db = admin.database();
const path = main().path;
const getShop = (req, res) => {
  
  console.log("Fetching Shop...");
  const ShopRef = db.ref(path+'/items/');

  ShopRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(404).json(createErrorResponse(ERROR_CODES.GAMES_NOT_FOUND, ERROR_CODES.GAMES_NOT_FOUND.message));
    }

    const Shop = snapshot.val();
    
    // تحويل البيانات إلى مصفوفة إذا لم تكن مصفوفة
    const ShopArray = Array.isArray(Shop) ? Shop : Object.values(Shop);
    
    // إضافة تسلسل لكل لعبة
    const ShopResponse = ShopArray.map((Shop, index) => ({
      name: Shop.name || 'No name',
      description: Shop.description || 'No description',
      icon: Shop.icon || 'No image',
      key: Shop.key || 'No key',
      group: Shop.group || 'No group',
      groupid: Shop.groupid || 'No groupid',
      id: Shop.id,//|| 'No id',
      rarity: Shop.rarity || 'No rarity',
      time: Shop.time || 'No time',
      type: Shop.type || 'No type',
      own:false,
      index: index + 1
    }));

    res.json(createSuccessResponse({ items: ShopResponse }, 'Shop fetched successfully.'));
  });
  
}
  
  module.exports = { getShop };