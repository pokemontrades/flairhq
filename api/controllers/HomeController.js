/**
 * HomeController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    var user = req.user;
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

    Game.find()
     .where({user: user.id})
     .where({type: "casual"})
     .exec(function (err, games) {

      res.view({
        user: user,
        references: {
          events: events,
          shinies: shinies,
          casuals: casuals,
          banks: banks
        },
        games: games
      });
    });
    });
    });
    });
    });
  },



  reference: function(req, res) {
    User.findOne({id: req.user}).exec(function (err, loggedin){
    console.log(loggedin);

    User.findOne({name: req.params.user}).exec(function (err, user){

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

    Game.find()
     .where({user: user.id})
     .where({type: "casual"})
     .exec(function (err, games) {

      res.view({
        user: loggedin,
        references: {
          events: events,
          shinies: shinies,
          casuals: casuals,
          banks: banks
        },
        games: games
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
