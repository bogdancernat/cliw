/**
 * Module dependencies.
 */

var express    = require('express')
  , app        = express()
  , http       = require('http')
  , server     = http.createServer(app)
  , io         = require('socket.io').listen(server)
  , conCouch   = require('connect-couchdb')(express)
  , config     = require('./config')
  , dbServer   = require('nano')(config.db.dbUrl)
  , couchStore = new conCouch({
      name           : config.db.dbName,
      reapInterval   : 600000,
      compactInterval: 300000,
      setThrottle    : 60000,
      host           : config.db.dbHost,
      username       : config.db.dbUser,
      password       : config.db.dbPass
    })
  , routes      = require('./routes')
  , path        = require('path')
  , passport    = require('passport')
  , auth        = require('./routes/auth')(passport)
  , storyboards = require('./routes/storyboards')
  , preview     = require('./routes/preview')
  , workspace   = require('./routes/workspace')
  , less        = require('less-middleware')
  ;


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.methodOverride());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  
  app.use(less(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.cookieParser('cookieSecret!'));
  app.use(express.bodyParser());
  app.use(express.session({secret: 'thisissecret', store: couchStore}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.errorHandler());
});
//configure passport
require('./passport-config')(passport);

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// app.get('/', auth.isAuthenticated, routes.index);
app.get('/', routes.index);
app.get('/workspace', workspace.index);
app.get('/preview', preview.index);
// routes
// app.get('/login', auth.loginPage);
app.get('/logout', auth.logout);
// app.get('/signup', auth.signupPage);
// authenticate facebook
app.get('/auth/facebook', auth.facebookAuth);
app.get('/auth/facebook/callback', auth.facebookAuthCallback);
// posts
app.post('/login', auth.loginEmail);
app.post('/signup', auth.signupEmail);

// create new storyboard 
app.post('/create', auth.isAuthenticatedPOST, storyboards.create);

app.post('/saveProject', auth.isAuthenticatedPOST, storyboards.save);

// sockets

io.sockets.on('connection', workspace.connection);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
