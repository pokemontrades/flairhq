/**
 * ReferenceController
 *
 * @description :: Server-side logic for managing References
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var reddit = require('redwrap');

module.exports = {

  edit: function (req, res) {
    req.params = req.allParams();
    user = User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
        User.update({id: user.id}, {intro: req.params.intro}).exec(function (err1, up1) {
          User.update({id: user.id}, {friendCodes: req.params.fcs}).exec(function (err2, up2) {
            if (err1) {
              res.json(err1, 500);
            } else if (err2) {
              res.json(err2, 400);
            } 

            Game.destroy({user: user.id}).exec(function (err, ref) {
              Game.create({user: user.id, ign: req.params.igns[0], tsv: req.params.tsvs[0]},
                function (err, ref) {
                  if (err) {
                    console.log(err);
                    res.json(400);
                  } else {
                    res.json(ref, 200);
                  }
                }
              );
            });
          });
        });
      }
    });
  }
};

