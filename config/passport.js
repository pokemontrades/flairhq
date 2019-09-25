var passport = require('passport'),
  RedditStrategy = require('passport-reddit').Strategy,
  config = require('./local');

var verifyHandler = function (adminToken, token, tokenSecret, profile, done) {
  User.findOne({name: profile.name}, function(err, user) {
    console.log(profile.name);
    console.log(user);
    Reddit.getBothFlairs(adminToken, profile.name).then(function (flairs) {
      if (user) {
        if (user.banned) {
          return done("banned", user);
        }
        User.update({id: user.id})
          .set({flair: {ptrades: flairs[0], svex: flairs[1]}, redToken: tokenSecret})
          .then(() => done(null, user))
          .catch((err) => done(err, user));
      } else {
        var data = {
          redToken: tokenSecret,
          name: profile.name,
          flair: {ptrades: flairs[0], svex: flairs[1]}
        };

        console.log("Creating user");
        User.create(data, function(err, user) {
          return done(err, user);
        });
      }
    }, function (error) {
      return done(error);
    });
  });
};

passport.serializeUser(function(user, done) {
  done(null, user.name);
});

passport.deserializeUser(function(name, done) {
  User.findOne({name: name}, function(err, user) {
    console.log(user);
    done(err, user);
  });
});

var callWithToken = function (token, tokenSecret, profile, done) {
  verifyHandler(sails.config.reddit.adminRefreshToken, token, tokenSecret, profile, done);
};

passport.use(new RedditStrategy({
  clientID: config.reddit.clientID,
  clientSecret: config.reddit.clientIDSecret,
  callbackURL: config.reddit.redirectURL,
  scope: 'flair,modflair,modcontributors,wikiread,wikiedit,read,modposts'
}, callWithToken));
