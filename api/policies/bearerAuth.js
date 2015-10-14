var passport = require('passport');

module.exports = function(req, res, next) {

  return passport.authenticate('reddit', { session: false })(req, res, next);

};