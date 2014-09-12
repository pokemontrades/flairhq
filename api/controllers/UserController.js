/**
 * ReferenceController
 *
 * @description :: Server-side logic for managing References
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var reddit = require('redwrap'),
    Q = require('q');

module.exports = {

  edit: function (req, res) {
    req.params = req.allParams();
    User.findOne({id: req.params.userid}, function (err, user) {
      if (!user) {
        res.json({error: "Can't find user"}, 404);
      } else {
        var updatedUser = {};
        if (req.params.intro) {
          updatedUser.intro = req.params.intro;
        }
        if (req.params.fcs) {
          updatedUser.friendCodes = req.params.fcs;
        }

        User.update({id: user.id}, updatedUser).exec(function (err, up) {
          if (err1) {
            res.json(err1, 500);
          } else if (err2) {
            res.json(err2, 400);
          } 

          var promises = [],
              games = [];

          req.params.games.forEach(function (game) {
            console.log(game.id + ":" + game.tsv + ":" + game.ign);
            if (game.id && game.tsv && game.ign) {
              promises.push(Game.update(
                {id: game.id}, 
                  {tsv: game.tsv, ign: game.ign})
                  .exec(function (err, game) {
                    if (err) {
                      console.log(err);
                      res.json(400);
                    } else {
                      games.push(game);
                    }
                  }
                ));    
             } else if(!game.id){
                console.log(game);
                promises.push(Game.create(
                  {user: user.id, tsv: game.tsv, ign: game.ign})
                  .exec(function (err, game) {
                    if (err) {
                      console.log(err);
                      res.json(400);
                    } else {
                      games.push(game);
                    }
                  }
                ));    
             }
          });

          Q.all(promises).then(function () {
            user.games = games;
            res.json(user, 200);
          });
        });
      }
    });
  },

  mine: function (req, res) {
    user = req.user;
      
    Game.find()
     .where({user: user.id})
     .exec(function (err, games) {
       user.games = games;
       res.json(user, 200);
     });
  },

  get: function (req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
      Game.find()
       .where({user: user.id})
       .exec(function (err, games) {

      Reference.find()
       .where({user: user.id})
       .where({type: ["event", "redemption"]})
       .sort("type")
       .exec(function (err, events) {

      Reference.find()
       .where({user: user.id})
       .where({type: "shiny"})
       .exec(function (err, shinies) {

      Reference.find()
       .where({user: user.id})
       .where({type: "casual"})
       .exec(function (err, casuals) {

      Reference.find()
       .where({user: user.id})
       .where({type: "bank"})
       .exec(function (err, banks) {

      Egg.find()
       .where({user: user.id})
       .exec(function (err, eggs) {

      Giveaway.find()
       .where({user: user.id})
       .exec(function (err, giveaways) {

      Comment.find()
       .where({user: user.id})
       .exec(function (err, comments) {

        user.references = {
          events: events,
          shinies: shinies,
          casuals: casuals,
          banks: banks,
          eggs: eggs,
          giveaways: giveaways
        }
        user.games = games;
        user.comments = comments;
        res.json(user, 200);

      });
      });
      });
      });
      });
      });
      });
      });
    });
  }
};

