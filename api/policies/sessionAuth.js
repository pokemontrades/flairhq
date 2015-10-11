/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is banned, log them out.
  if (req.user && req.user.banned) {
    req.logout();
    if (req.isSocket) {
      return res.json({status: 403, error: "You have been banned from FAPP"}, 403);
    }
    return res.view(403, {error: "You have been banned from FAPP"});
  }

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.user || (req.isAuthenticated && req.isAuthenticated())) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  if (req.isSocket) {
    return res.json({status: 403, redirectTo: "/login"}, 403);
  }
  return res.redirect('/login');
};
