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

var project = {
  type         : 'project',
  owner        : null,
  short_url    : null,
  name         : null,
  collaborators: [],
  closed       : false,
  active       : false,
  pages        : {},
  created_on   : null,
}

var savedProject = {
  type      : 'project-slideshow',
  owner     : null,
  short_url : null,
  pages     : [],
  name      : null,
  created_on: null
}
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
  var design_doc_auth = {
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
        db.insert(design_doc_auth,'_design/multiauth-views',function (err3, res) {
          console.log("Created views for auth.")
        });
      });
    } else {
      db.insert(design_doc_auth,'_design/multiauth-views',function (err3, res) {
        console.log("Created views for auth.")
      });
    }
  });

  var design_doc = {
    "views":{
      'projects':{
        'map': function (doc) {
          if(doc.type=='project') {
            emit(doc.short_url, doc);
          }
        }
      },
      'projects_minimal':{
        'map': function (doc) {
          if(doc.type=='project') {
            emit(doc.short_url, {
              _id: doc._id,
              name: doc.name
            });
          }
        }
      },
      'projects_by_id':{
        'map': function (doc) {
          if(doc.type=='project') {
            emit(doc._id, doc);
          }
        }
      },
      'projects_open_by_owner':{
        'map': function (doc) {
          if(doc.type=='project' && doc.closed == false) {
            emit(doc.owner, doc);
          }
        }
      },
      'saved_projects': {
        'map': function (doc) {
          if(doc.type=='project-slideshow') {
            emit(doc.short_url, doc);
          }
        }
      }
    }
  };

  db.get('_design/cose-views', null, function (err, body) {
    if (!err) {
      db.destroy('_design/cose-views',body._rev,function (err2, body2) {
        db.insert(design_doc,'_design/cose-views',function (err3, res) {
          console.log("Created views for data.")
        });
      });
    } else {
      db.insert(design_doc,'_design/cose-views',function (err3, res) {
        console.log("Created views for data.")
      });
    }
  });
}

exports.getUserModel = function () {
  return JSON.parse(JSON.stringify(user));
}
exports.getProjectModel = function () {
  return JSON.parse(JSON.stringify(project));
}
exports.getSlideshowModel = function () {
  return JSON.parse(JSON.stringify(savedProject));
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
exports.filterUsers = function (query, callback) {
  // if query is abc , startkey = abc, endkey = abd;
  var startKey = query
    , nextLastChar = String.fromCharCode(startKey.charCodeAt(startKey.length-1)+1)
    , endKey
    ;

  //  check if nextLastChar is DEL. This resulted from a query that ends in "~"
  if(nextLastChar.charCodeAt(0) == 127){
    endKey = startKey +" ";
  } else {
    endKey = startKey.substring(0,startKey.length-1);
    endKey = endKey+nextLastChar;
  }
  // this encoded spaces and other characters to %20 and fucked the search up.
  // startKey = encodeURIComponent(startKey);
  // endKey = encodeURIComponent(endKey);
  // console.log(startKey, endKey);
  activeDb.view('multiauth-views','users_key_email',{startkey: startKey, endkey: endKey},function (err,body){
    if(!err){
      // remove user's selected brands from results
      // var result = body.rows.map(excludeSelectedBrands);
      // callback(result);
      // console.log(body.rows);
      callback(body.rows);
    } else {
      callback([]);
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

/* Get projects */
exports.getSavedProject = function (url, callback) {
  db.view('cose-views', 'saved_projects', {key: url}, function (err, body){
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}
exports.getSavedProjects = function (callback) {
  db.view('cose-views', 'saved_projects', function (err, body){
    if(!err && body.rows.length) {
      callback(body.rows);
    } else {
      callback([]);
    }
  });
}
exports.getProject = function (url, callback) {
  db.view('cose-views', 'projects', {key: url}, function (err, body){
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}
exports.getProjectMinimal = function (url, callback){
  db.view('cose-views', 'projects_minimal', {key: url}, function (err, body){
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}
exports.getProjectById = function (url, callback) {
  db.view('cose-views', 'projects_by_id', {key: url}, function (err, body){
    if(!err && body.rows.length) {
      callback(body.rows[0].value);
    } else {
      callback(null);
    }
  });
}

exports.getUnfinishedProjects = function (callback){
  db.view('cose-views', 'projects_open_by_owner', function (err, body){
    if(!err && body.rows.length) {
      callback(body.rows);
    } else {
      callback(null);
    }
  });
}

exports.getOwnerUnfinishedProjects = function (owner, callback){
  db.view('cose-views', 'projects_open_by_owner', {key: owner}, function (err, body){
    if(!err && body.rows.length) {
      callback(body.rows);
    } else {
      callback([]);
    }
  });
}

/* END Get projects */

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
