/* global User, Reddit */
/**
 * HomeController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    User.findOne({id: req.user.id}, function(err, user) {
      if (user) {
        res.view();
        Reddit.getFlair(user.redToken, function (flair1, flair2) {
          if (flair1 || flair2) {
            user.flair = {ptrades: flair1, svex: flair2};
            user.save(function (err) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      } else {
        res.json(400);
      }
    });
  },

  reference: function(req, res) {
    User.findOne({name: req.params.user}).exec(function (err, user){
      if (!user) {
        res.json(404);
      } else {
        res.view();
      }
    });
  },

  banlist: function (req, res) {
    res.view();
  },

  applist: function (req, res) {
    res.view();
  },

  info: function (req, res) {
    res.view();
  }
};
