var validator = require('validator')
  , configs = require('../config')
  ;

module.exports = function (passport) {
  var auth = {
    loginPage: function (req, res) {
      res.render('login', {title: 'Auth'});
    },

    signupPage: function (req, res) {
      res.render('signup', {title: 'Auth'});
    },

    isAuthenticated: function (req, res, next) {
      if(req.isAuthenticated()) {
        return next();
      } else {
        res.redirect('/');
      }
    },
    isAuthenticatedPOST: function (req, res, next) {
      if(req.isAuthenticated()) {
        return next();
      } else {
        res.send(401);
      }
    },
    logout: function (req, res) {
      req.logout();
      res.redirect('/');
    },
    loginEmail: function (req, res) {
      if(req.body.password.length >=5
          && validator.isEmail(req.body.email)) {
        passport.authenticate('local-login', {
          successRedirect: '/',
          failureRedirect: '/'
        })(req, res);

        // passport.authenticate('local-login', function (err, user) {
        //   if(err) {
        //     res.redirect('/login');
        //   } else {
        //     if(user === false) {
        //       res.redirect('/login');
        //     } else {
        //       res.redirect('/');
        //     }
        //   }
        // });
      } else {
        res.redirect('/');
      }
    },

    signupEmail: function (req, res) {
      if(req.body.password == req.body.passwordRetype
          && req.body.password.length >= 5
            && validator.isEmail(req.body.email)) {
        passport.authenticate('local-signup', {
          successRedirect: '/',
          failureRedirect: '/'
        })(req, res);

        // passport.authenticate('local-signup', function (err, user) {
        //   if(err) {
        //     res.redirect('/signup');
        //   } else {
        //     if(!user) {
        //       // console.log('user exists');
        //       res.redirect('/signup');
        //     } else {
        //       // console.log('user created');
        //       res.redirect('/');
        //     }
        //   }
        // });
      } else {
        res.redirect('/');
      }
    },
    facebookAuth: function (req, res) {
      passport.authenticate('facebook', {scope: configs.facebookAuth.scope})(req, res);
    },
    facebookAuthCallback: function (req, res) {
      passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
      })(req, res);
    },
    facebookAuthorize: function (req, res) {
      passport.authorize('facebook', {scope: configs.facebookAuth.scope})(req, res);
    },
    facebookAuthorizeCallback: function (req, res) {
      passport.authorize('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
      })(req, res);
    },

    twitterAuth: function (req, res) {
      passport.authenticate('twitter', {scope: configs.twitterAuth.scope})(req, res);
    },
    twitterAuthCallback: function (req, res){
      passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/'
      })(req, res);
    },
    googleAuth: function (req, res) {
      passport.authenticate('google',{scope: configs.googleAuth.scope})(req, res);
    },
    googleAuthCallback: function (req, res){
      passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/'
      })(req, res);
    }

  }
  return auth;
}
