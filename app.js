/** Dependency Injection */
var express = require('express'),
  path = require('path'), // Node In-Build Module
  session = require('express-session'), // $ npm install express-session
  cookieParser = require('cookie-parser'), // $ npm install cookie-parser
  passport = require('passport'), // $ npm install passport
  mongoose = require('mongoose'), // $ npm install mongoose
  CONFIG = require('./config/config'), // Injecting Our Configuration
  helmet = require('helmet'),
  compression = require('compression');
/** /Dependency Injection end */

var app = express(); // Initializing ExpressJS
var server = require('http').createServer(app);

/** Global Configuration*/
global.GLOBAL_CONFIG = CONFIG.GLOBAL;
mongoose.Promise = global.Promise;
/** Global Configuration end */

/** Middleware Configuration */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;

//  Adding Neccessary Security Request Headers
// app.use(
//   helmet()
// );

app.use(express.urlencoded({ limit: '100mb', extended: true })); // Parse application/x-www-form-urlencoded
app.use(express.json({ limit: '100mb' }));
app.use(cookieParser('Careagencymedia')); // cookieParser - Initializing/Configuration cookie: {maxAge: 8000},
app.use(session({ secret: 'Careagencymedia', resave: true, saveUninitialized: true })); // express-session - Initializing/Configuration
app.use(passport.initialize()); // passport - Initializing
app.use(passport.session()); // passport - User Session Initializing
// app.use(flash()); // flash - Initializing
app.use(compression()); //use compression middleware to compress and serve the static content.
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads'), { maxAge: 7 * 86400000 }));
app.use(
  '/logs/error.log',
  express.static(path.join(__dirname, '/logs/error.log'), {
    maxAge: 100 * 10000,
  })
); // Serving Static Files For Sitemap


//static image in uri 
app.use('/uploads', express.static('./uploads'));


app.locals.pretty = false;
app.set('views', 'views');
app.set('view engine', 'html');
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, adminid, userid'
  );
  next();
});


/** Middleware Configuration end */

/** Socket Connection */
var io = require('socket.io')(server);
/** Socket Connection end */

/** MongoDB Connection */
var mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  keepAlive: 1,
  // reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  // reconnectInterval: 500, // Reconnect every 500ms
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  useUnifiedTopology: true,
};

mongoose.connect(CONFIG.DB_URL, mongooseOptions);

mongoose.connection.on('error', function (error) {
  console.error('Error in MongoDb connection: ' + error);
});

mongoose.connection.on('connected', function () {
  console.log('MongoDB connected!');
});
mongoose.connection.on('reconnected', function () {
  console.log('MongoDB reconnected!');
});
mongoose.connection.on('disconnected', function () {
  console.log('MongoDB disconnected!');
});
/** MongoDB Connection end */

/** Dependency Mapping */
require('./routes')(app, io);
require('./cron')(app, io); 
// require('./sockets')(app, io);
/** Dependency Mapping end */

/** HTTP Server Instance */
try {
  server.listen(CONFIG.PORT, function () {
    console.log('Server runing on ', CONFIG.ENV, 'mode in port', CONFIG.PORT);
  });
} catch (ex) {
  console.log(ex);
}
/** /HTTP Server Instance end */
