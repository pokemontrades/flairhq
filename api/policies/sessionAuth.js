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
  if (req.user) {
    if (req.user.banned) {
      req.session.destroy();
      return res.view(403, {error: "You have been banned from FlairHQ"});
    }
    return next();
  }
  if (req.isSocket) {
    return res.status(403).json({status: 403, redirectTo: "/login"});
  }
  return res.redirect('/login' + (req.url !== '/' ? '?redirect=' + encodeURIComponent(req.url) : ''));
};
