module.exports = (req, res, next) => (Users.hasModPermission(req.user, 'posts') && Users.hasModPermission(req.user, 'wiki')) ? next() : res.forbidden("Not post mod");
