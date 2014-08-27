/**
 * HomeController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    var user = req.user;
    Reference.find({user: user.id}, function (err, refs) {
      if(err) {
        res.json(400);
      } else {
        res.view({
          user: user,
          references: refs
        });
      }
    });

  }
};
