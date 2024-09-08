const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const { loginLimiter } = require('./middlewares/rateLimit');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const userRoutes = require('./routes/user');

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Firebase Admin SDK


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['upbeat-hickory-expansion.glitch.me'], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: 60000 }
}));

// CSRF Protection
// const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection);
// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });
// Routes

app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/user',  userRoutes);


const PROTO_PATH = path.join(__dirname, 'service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

function myMethod(call, callback) {
  const requestData = call.request;

  // قراءة البيانات من الطلب
  console.log("Received data:", requestData);
  callback(null, { ResultCode : 1, Message: 'Success' });
}

// // إعداد gRPC سيرفر
const grpcServer = new grpc.Server();
grpcServer.addService(protoDescriptor.MyService.service, { MyMethod: myMethod });
grpcServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
grpcServer.start();
console.log('gRPC server running at http://0.0.0.0:50051');

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
