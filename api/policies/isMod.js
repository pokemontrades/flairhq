/**
 * isaMod
 *
 * @module      :: Policy
 * @description :: Policy to only allow mods to perform certain actions
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  if (req.user && req.user.isMod) {
    return next();
  }

  return res.forbidden('Not a mod');
};
