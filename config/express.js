var passport = require('passport'),
  RedditStrategy = require('passport-reddit').Strategy;

var verifyHandler = function (adminToken, token, tokenSecret, profile, done) {
  process.nextTick(function() {
    User.findOne({name: profile.name}, function(err, user) {
      Reddit.getBothFlairs(adminToken, profile.name, function (redditerr, flair1, flair2) {
        if (user) {
          if (user.banned) {
            return done("You are banned from FAPP", user);
          }
          user.redToken = tokenSecret;
          user.flair = {ptrades: flair1, svex: flair2};
          user.save(function (err) {
            if (err) {
              console.log(err);
            }
            return done(null, user);
          });
        } else {
          var data = {
            redToken: tokenSecret,
            provider: profile.provider,
            name: profile.name,
            flair: {ptrades: flair1, svex: flair2}
          };

          if (profile.emails && profile.emails[0] && profile.emails[0].value) {
            data.email = profile.emails[0].value;
          }
          if (profile.name && profile.name.givenName) {
            data.firstname = profile.name.givenName;
          }
          if (profile.name && profile.name.familyName) {
            data.lastname = profile.name.familyName;
          }

          User.create(data, function(err, user) {
            return done(err, user);
          });
        }
      });
    });
  });
};

passport.serializeUser(function(user, done) {
  done(null, user.name);
});

passport.deserializeUser(function(name, done) {
  User.findOne({name}, function(err, user) {
    done(err, user);
  });
});

/**
 * Configure advanced options for the Express server inside of Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#documentation
 */
module.exports.http = {

  customMiddleware: function(app) {
    var callWithToken = function (token, tokenSecret, profile, done) {
      verifyHandler(sails.config.reddit.adminRefreshToken, token, tokenSecret, profile, done);
    };
    passport.use(new RedditStrategy({
      clientID: sails.config.reddit.clientID,
      clientSecret: sails.config.reddit.clientIDSecret,
      callbackURL: sails.config.reddit.redirectURL,
      scope: 'flair,modflair,modcontributors,wikiread,wikiedit,read,modposts'
    }, callWithToken));

    app.use(passport.initialize());
    app.use(passport.session());
  }

};


/**
 * HTTP Flat-File Cache
 *
 * These settings are for Express' static middleware- the part that serves
 * flat-files like images, css, client-side templates, favicons, etc.
 *
 * In Sails, this affects the files in your app's `assets` directory.
 * By default, Sails uses your project's Gruntfile to compile/copy those
 * assets to `.tmp/public`, where they're accessible to Express.
 *
 * The HTTP static cache is only active in a 'production' environment,
 * since that's the only time Express will cache flat-files.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#documentation
 */
module.exports.cache = {

  // The number of seconds to cache files being served from disk
  // (only works in production mode)
  maxAge: 31557600000
};
