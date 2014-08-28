/**
 * ReferenceController
 *
 * @description :: Server-side logic for managing References
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var reddit = require('redwrap');

module.exports = {

  get: function (req, res) {
    user = User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
        Reference.find({user: user.id}, function (err, refs) {
          if(err) {
            res.json(400);
          } else {
            res.json(refs, 200);
          }
        });
      }
    });
  },

  add: function (req, res) {
    req.params = req.allParams();
    user = User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
	Reference.findOne({url: req.params.url, user: user.id}, function (err, refs) {
          if(err || refs) {
            res.json(400);
          } else {
            Reference.create(
              {
               url: req.params.url, 
               user: user.id, 
               user2: req.params.user2,
               descrip: req.params.descrip,
               type: req.params.type
              }, 
              function (err, ref) {
                if (err) {
                  console.log(err);
                  res.json(400);
                } else {
                  res.json(ref, 200);
                }
              }
            );
          }
        });
      }
    });
  }
};

