/**
 * NewModmailController
 *
 * @description :: Server-side logic for managing Modmails
 */

var refreshToken = sails.config.reddit.adminRefreshToken;

module.exports = {

  getAll: async function (req, res) {
    req.params = req.allParams();
    let allResults = await Reddit.getNewModmail(refreshToken, ['pokemontrades','svexchange'], '347q1', 'all');

    let allConversations = Modmailv2.formatConversations(allResults);
    let allMessages      = Modmailv2.formatMessages(allResults);
    let allActions       = Modmailv2.formatActions(allResults);

    if (allMessages.length > 0) {
      let msgAdd    = await ModmailMsg
        .findOrCreate(allMessages)
        .catch( e => {console.log(e)});
    }
    /*if (allActions.length > 0) {
      let actionAdd = await ModmailAction
        .findOrCreate(allActions)
        .catch( e => {console.log(e)});
    }*/
    if (allConversations.length > 0) {
      let convAdd   = await ModmailConv
      .findOrCreate(allConversations)
      .catch( e => {console.log(e)});
    }

    // Create associations (have to add actions)
    let promises = [];
    allConversations.forEach(element => {
      promises.push(Modmailv2.createMsgAssociation(element));
    });
    Promise.all(promises).then(function (results) {
      return res.ok(results);
    }, function (error) {
      return res.serverError(error);
});
    res.ok(allConversations);
  },

  listAll: async function (req, res) {
    console.log(await ModmailConv.find({}).populate('messages'));
    //res.ok("ok");
//await ModmailConv.update('347q0').set({messages: ['51hqv','51hqo']});
    /*
    ModmailConv.findOne('347q0')
    .exec(function(err,user){ 
      user.messages.add = (ModmailMsg.findOne('51hqv'))._id;
      user.messages.add = (ModmailMsg.findOne('51hqo'))._id;
      user.save();
    })*/
    res.ok("ok");
  },




};
