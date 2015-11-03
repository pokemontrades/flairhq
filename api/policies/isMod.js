/**
 * isMod
 *
 * @module      :: Policy
 * @description :: Policy to only allow mods to perform certain actions
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  if (req.user && req.user.isMod) {
    return next();
  }

  return res.forbidden('Not a mod');
};
