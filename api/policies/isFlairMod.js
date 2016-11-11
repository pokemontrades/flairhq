module.exports = (req, res, next) => Users.hasModPermission(req.user, 'flair') ? next() : res.forbidden();
