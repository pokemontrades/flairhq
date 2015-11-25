var passport = require('passport');

module.exports = function (req, res, next) {
  // Initialize Passport
  passport.initialize()(req, res, function () {
    // Use the built-in sessions
    passport.session()(req, res, function () {
      // Make the user and query available throughout the frontend
      res.locals.user = req.user;
      res.locals.query = req.query;
      next();
    });
  });
};