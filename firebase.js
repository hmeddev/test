const admin = require('firebase-admin');
const serviceAccount = require('./admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://theai-bot-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();


