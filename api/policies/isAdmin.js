module.exports = (req, res, next) => Users.hasModPermission(req.user, 'all') ? next() : res.forbidden('Not a mod');
