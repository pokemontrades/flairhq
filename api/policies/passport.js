var passport = require('passport');

module.exports = function (req, res, next) {
  // Initialize Passport
  passport.initialize()(req, res, function () {
    // Use the built-in sessions
    passport.session()(req, res, async function () {
      try {
        res.locals.user = req.user;
        if (res.locals.user) {
          res.locals.user.redToken = undefined;
        }
        res.locals.query = req.query;
        res.locals.flairs = await Flairs.getFlairs();
        if (req.user && req.user.isMod) {
          res.locals.flairApps = await Flairs.getApps();
        }
        next();
      } catch (err) {
        return res.serverError(err);
      }
    });
  });
};