var db               = require('./db')
  , localStrategy    = require('passport-local').Strategy
  , facebookStrategy = require('passport-facebook').Strategy
  , twitterStrategy  = require('passport-twitter').Strategy
  , googleStrategy   = require('passport-google-oauth').OAuth2Strategy
  , bcrypt           = require('bcrypt')
  , configAuth       = require('./config')
  ;

module.exports = function (passport) {
  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    db.getUserById(id, function (doc) {
      done(null, doc);
    })
  });

  passport.use('local-signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function (email, password, done) {
    db.getUser(email, function (doc) {
      if(doc) {
        // console.log('document exists');
        done(null, false);
      } else {
        var user        = db.getUserModel();
        user.email      = email;
        user.created_on = +(new Date());

        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(password, salt, function (err, crypted) {
            user.password = crypted;

            db.insert(user, function (data) {
              // console.log('inserting into db');
              done(null, data);
            });

          });
        });
      }
    });
  }));

  passport.use('local-login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function (email, password, done) {
    db.getUser(email, function (doc) {
      if(!doc) {
        done(null, false);
      } else {
        bcrypt.compare(password, doc.password, function (err, match) {
          if(match) {
            done(null, doc);
          } else {
            done(null, false);
          }
        });
      }
    });
  }));

  // the following strategy could be broken in 2 pieces, one only for
  // authentication and the other for authorization
  passport.use(new facebookStrategy({
    clientID         : configAuth.facebookAuth.id,
    clientSecret     : configAuth.facebookAuth.secret,
    callbackURL      : configAuth.facebookAuth.callback,
    passReqToCallback: true
  }, function (req, token, refreshToken, profile, done) {
    // console.log(profile);
    process.nextTick(function() {
      if(!req.user) {
        db.getUserByFbId(profile.id, function (doc) {
          if(doc) {
            // we found a user with this profile id, use him.
            // console.log('facebook exists');
            done(null, doc);
          } else {
            // check if there is an account created with fb's primary email

            if(profile.emails.length) {
              // user has at least one email
              db.getUser(profile.emails[0].value, function (doc) {
                if(doc) {
                  // update with facebook data
                  doc.facebook_id        = profile.id;
                  doc.facebook_username  = profile.username;
                  doc.facebook_email     = profile.emails[0].value;
                  doc.facebook_token     = token;
                  doc.facebook_firstName = profile.name.givenName;
                  doc.facebook_lastName  = profile.name.familyName;
                  doc.facebook_gender    = profile.gender;

                  db.update(doc, doc._id, function (data) {
                    // console.log('inserting into db');
                    done(null, data);
                  });
                } else {
                  // couldn't find a user with that email nor with that facebook id, create new account
                  // console.log('creating new facebook account');
                  var user                = db.getUserModel();
                  user.email              = profile.emails[0].value;
                  user.facebook_id        = profile.id;
                  user.facebook_username  = profile.username;
                  user.facebook_email     = profile.emails[0].value;
                  user.facebook_token     = token;
                  user.facebook_firstName = profile.name.givenName;
                  user.facebook_lastName  = profile.name.familyName;
                  user.facebook_gender    = profile.gender;
                  user.created_on         = +(new Date());

                  db.insert(user, function (data) {
                    // console.log('inserting into db');
                    done(null, data);
                  });
                }
              });
            } else {
              // user has no emails present in his facebook profile, create new account
              // console.log('creating new account with data from facebook');
              var user                = db.getUserModel();
              user.email              = profile.emails[0].value;
              user.facebook_id        = profile.id;
              user.facebook_username  = profile.username;
              user.facebook_email     = profile.emails[0].value;
              user.facebook_token     = token;
              user.facebook_firstName = profile.name.givenName;
              user.facebook_lastName  = profile.name.familyName;
              user.facebook_gender    = profile.gender;
              user.created_on         = +(new Date());

              db.insert(user, function (data) {
                // console.log('inserting into db');
                done(null, data);
              });
            }
          }
        });
      } else {
        done(null, null);
      }
    });
  }));

  passport.use('facebook-update', new facebookStrategy({
    clientID         : configAuth.facebookAuth.id,
    clientSecret     : configAuth.facebookAuth.secret,
    callbackURL      : configAuth.facebookAuth.callback,
    passReqToCallback: true
  }, function (req, token, refreshToken, profile, done) {
    process.nextTick(function() {
      if(req.user) {
        // user logged in, complete with facebook data.
        db.getUserByFbId(req.user._id, function (doc) {
          doc.facebook_id        = profile.id;
          doc.facebook_username  = profile.username;
          doc.facebook_email     = profile.emails[0].value;
          doc.facebook_token     = token;
          doc.facebook_firstName = profile.name.givenName;
          doc.facebook_lastName  = profile.name.familyName;
          doc.facebook_gender    = profile.gender;
          db.update(doc, doc._id, function (data) {
            done(null, data);
          });
        });
      } else {
        done(null, null);
      }
    });
  }));

  passport.use(new twitterStrategy({
    consumerKey      : configAuth.twitterAuth.key,
    consumerSecret   : configAuth.twitterAuth.secret,
    callbackURL      : configAuth.twitterAuth.callback,
    passReqToCallback: true
  }, function (req, token, tokenSecret, profile, done) {

    process.nextTick(function() {
      if(!req.user) {
        db.getUserByTwId(profile.id, function (doc) {
          if(doc) {
            done(null, doc);
          } else {
            var user                    = db.getUserModel();
            user.twitter_id             = profile.id;
            user.twitter_username       = profile.username;
            user.twitter_token          = token;
            user.twitter_displayName    = profile.displayName;
            user.twitter_profilePicture = profile._json.profile_image_url.replace('_normal','');
            user.created_on             = +(new Date());

            db.insert(user, function (data) {
              // console.log('inserting into db');
              done(null, data);
            });
          }
        });
      } else {
        done(null, null);
      }
    });
  }));

  passport.use('twitter-update', new twitterStrategy({
    consumerKey      : configAuth.twitterAuth.key,
    consumerSecret   : configAuth.twitterAuth.secret,
    callbackURL      : configAuth.twitterAuth.callback,
    passReqToCallback: true
  }, function (req, token, refreshToken, profile, done) {
    process.nextTick(function() {
      if(req.user) {
        // user logged in, complete with facebook data.
        db.getUserById(req.user._id, function (doc) {
          doc.twitter_id             = profile.id;
          doc.twitter_username       = profile.username;
          doc.twitter_token          = token;
          doc.twitter_displayName    = profile.displayName;
          doc.twitter_profilePicture = profile._json.profile_image_url.replace('_normal','');

          db.update(doc, doc._id, function (data) {
            // console.log('inserting into db');
            done(null, data);
          });
        });
      } else {
        done(null, null);
      }
    });
  }));

  passport.use(new googleStrategy({
    clientID         : configAuth.googleAuth.id,
    clientSecret     : configAuth.googleAuth.secret,
    callbackURL      : configAuth.googleAuth.callback,
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
    // console.log(profile);
    process.nextTick(function() {
      if(!req.user) {
        db.getUserByGoogleId(profile.id, function (doc) {
          if(doc) {
            done(null, doc);
          } else {
            // check and see if there is an account with this email
            db.getUser(profile._json.email, function (doc) {
              if(doc) {
                // update with google data
                db.getUserById(req.user._id, function (doc) {
                  doc.google_id             = profile.id;
                  doc.google_email          = profile._json.email;
                  doc.google_token          = accessToken;
                  doc.google_displayName    = profile.displayName;
                  doc.google_firstName      = profile.name.givenName;
                  doc.google_lastName       = profile.name.familyName;
                  doc.google_gender         = profile._json.gender;
                  doc.google_profilePicture = profile._json.picture;

                  db.update(doc, doc._id, function (data) {
                    // console.log('inserting into db');
                    done(null, data);
                  });
                });
              } else {
                // couldn't find a user with that email nor with that facebook id, create new account
                var user                   = db.getUserModel();
                user.google_id             = profile.id;
                user.google_email          = profile._json.email;
                user.google_token          = accessToken;
                user.google_displayName    = profile.displayName;
                user.google_firstName      = profile.name.givenName;
                user.google_lastName       = profile.name.familyName;
                user.google_gender         = profile._json.gender;
                user.google_profilePicture = profile._json.picture;
                user.created_on            = +(new Date());
                db.insert(user, function (data) {
                  done(null, data);
                });
              }
            });
          }
        });
      } else {
        done(null, null);
      }
    });
  }));

  passport.use('google-update', new googleStrategy({
    clientID         : configAuth.googleAuth.id,
    clientSecret     : configAuth.googleAuth.secret,
    callbackURL      : configAuth.googleAuth.callback,
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      if(req.user) {
        // user logged in, complete with google data.
        db.getUserById(req.user._id, function (doc) {
          doc.google_id             = profile.id;
          doc.google_email          = profile._json.email;
          doc.google_token          = accessToken;
          doc.google_displayName    = profile.displayName;
          doc.google_firstName      = profile.name.givenName;
          doc.google_lastName       = profile.name.familyName;
          doc.google_gender         = profile._json.gender;
          doc.google_profilePicture = profile._json.picture;

          db.update(doc, doc._id, function (data) {
            // console.log('inserting into db');
            done(null, data);
          });
        });
      } else {
        done(null, null);
      }
    });
  }));
}