var config   = require('./config')
  , dbServer = require('nano')(config.db.dbUrl)
  , dbName   = config.db.dbName
  ;

var user = {
  type                   : 'user',
  email                  : null,
  password               : null,
  facebook_id            : null,
  facebook_username      : null,
  facebook_email         : null,
  facebook_token         : null,
  facebook_firstName     : null,
  facebook_lastName      : null,
  facebook_gender        : null,
  facebook_profilePicture: null,
  twitter_id             : null,
  twitter_username       : null,
  twitter_displayName    : null,
  twitter_token          : null,
  twitter_email          : null,
  twitter_profilePicture : null,
  google_id              : null,
  google_email           : null,
  google_firstName       : null,
  google_displayName     : null,
  google_lastName        : null,
  google_token           : null,
  google_gender          : null,
  google_profilePicture  : null,
  created_on             : null
};


dbServer.db.get(dbName, function (err) {
  if (err) {
    console.log('Got some error: ' + err);
    console.log('Creating database...');
    dbServer.db.create(dbName, function (err) {
      if (err) {
        console.log('Oups! There was a problem creating the database: '+ dbName +'.')
        throw err;
      } else {
        console.log('Database ' + dbName + ' created!');
        db = dbServer.use(dbName);
        addDefaultData();
      }
    });
  } else {
    console.log('Selecting database '+ dbName +'!');
    db = dbServer.use(dbName);
    console.log('Database ' + dbName + ' selected!');
      addDefaultData();
  }
});

function addDefaultData() {

  var design_doc = {
    'views':{
      'users_key_email':{
        'map': function (doc) {
          if(doc.type=='user') {
            emit(doc.email, doc);
          }
        }
      },
      'users_key_id':{
        'map': function (doc) {
          if(doc.type=='user') {
            emit(doc._id, doc);
          }
        }
      },
      'users_key_fb_id':{
        'map': function (doc) {
          if(doc.type=='user') {
            emit(doc.facebook_id, doc);
          }
        }
      },
      'users_key_tw_id':{
        'map': function (doc) {
          if(doc.type=='user') {
            emit(doc.twitter_id, doc);
          }
        }
      },
      'users_key_google_id':{
        'map': function (doc) {
          if(doc.type=='user') {
            emit(doc.google_id, doc);
          }
        }
      },
    }
  };
  // adding views to couch
  db.get('_design/multiauth-views', null, function (err, body) {
    if (!err) {
      db.destroy('_design/multiauth-views',body._rev,function (err2, body2) {
        db.insert(design_doc,'_design/multiauth-views',function (err3, res) {
          console.log("Created views.")
        });
      });
    } else {
      db.insert(design_doc,'_design/multiauth-views',function (err3, res) {
        console.log("Created views.")
      });
    }
  });
}

exports.getUserModel = function () {
  return JSON.parse(JSON.stringify(user));
}

/* Get user/users by various keys */

exports.getUser = function (email, callback) {
  db.view('multiauth-views', 'users_key_email', {key: email},function (err, body) {
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}

exports.getUserById = function (id, callback) {
  db.view('multiauth-views', 'users_key_id', {key: id}, function (err, body) {
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}
exports.getUserByFbId = function (fb_id, callback) {
  db.view('multiauth-views', 'users_key_fb_id', {key: fb_id}, function (err, body) {
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}
exports.getUserByTwId = function (tw_id, callback) {
  db.view('multiauth-views', 'users_key_tw_id', {key: tw_id}, function (err, body) {
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}
exports.getUserByGoogleId = function (google_id, callback) {
  db.view('multiauth-views', 'users_key_google_id', {key: google_id}, function (err, body) {
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}
/* END Get user/users by various keys */

exports.insert = function (obj, callback) {
  db.insert(obj, function (err, body, header) {
    if (err) {
      throw (err);
    } else {
      body._id = body.id;
      callback(body);
    }
  });
}

exports.update = function (obj, objId, callback) {
  db.insert(obj, objId, function (err, body, header) {
    if (err) {
      throw (err);
    } else {
      // console.log('inserted');
      // console.log(obj);
      body._id = body.id;
      callback(body);
    }
  });
}