var passport = require('passport');

module.exports = function (req, res, next) {
  // Initialize Passport
  passport.initialize()(req, res, function () {
    // Use the built-in sessions
    passport.session()(req, res, async function () {
      try {
        res.locals.user = req.user;
        if (req.user) {
          res.locals.user.games = await Game.find({user: req.user.name});
        }
        res.locals.query = req.query;
        res.locals.flairs = await Flairs.getFlairs();
        if (Users.hasModPermission(req.user, 'flair')) {
          res.locals.flairApps = await Flairs.getApps();
        }
        next();
      } catch (err) {
        return res.serverError(err);
      }
    });
  });
};
