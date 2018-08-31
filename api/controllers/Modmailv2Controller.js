/**
 * NewModmailController
 *
 * @description :: Server-side logic for managing Modmails
 */

var refreshToken = sails.config.reddit.adminRefreshToken;

module.exports = {

  getAll: async function (req, res) {
    req.params = req.allParams();
    
    let resultsAll = (await Reddit.getNewModmail(refreshToken, ['pokemontrades','svexchange'], '' , 'all')); // '347q1'
    let resultsMod = (await Reddit.getNewModmail(refreshToken, ['pokemontrades','svexchange'], '' , 'mod'));
    let resultsArc = (await Reddit.getNewModmail(refreshToken, ['pokemontrades','svexchange'], '' , 'archived'));
    let allResults = [Array.prototype.concat(resultsAll[0], resultsMod[0], resultsArc[0])];
    // inprogress, new, notifications, highlighted are not necessary
    
    let allConversations = Modmailv2.formatConversations(allResults);
    let allMessages      = Modmailv2.formatMessages(allResults);
    let allActions       = Modmailv2.formatActions(allResults);

    if (allMessages.length > 0) {
      let msgAdd    = await ModmailMsg
        .findOrCreate(allMessages)
        .catch( e => {sails.log(e)});
    }
    if (allActions.length > 0) {
      let actionAdd = await ModmailAction
        .findOrCreate(allActions)
        .catch( e => {console.log(e)});
    }
    if (allConversations.length > 0) {
      let convAdd   = await allConversations.map(conversation => {
        ModmailConv.findOrCreate({ id: conversation.id }, conversation)
        .exec(function(err, newOrExistingRecord, wasCreated) {
          if (err) { sails.log.error(err); }
          //console.log (newOrExistingRecord);
          //console.log (wasCreated);
          //console.log (conversation.id);
          return newOrExistingRecord;
        })
      })
    };

      /*.findOrCreate(allConversations) /* NEED TO FINISH UPDATING PART
      .exec(function(err, newOrExistingRecord, wasCreated) {
        if (!(wasCreated) && newOrExistingRecord.lastUpdated < allConversations.lastUpdated ) {

        }
      })
      .catch( e => {console.log(e)});*/

/*
    // Create associations (have to add actions)
    let promises = [];
    allConversations.forEach(element => {
      promises.push(Modmailv2.createMsgAssociation(element));
    });
    Promise.all(promises).then(function (results) {
      return res.ok(results);
    }, function (error) {
      return res.serverError(error);
});*/
    //res.ok(allConversations);
  },

  listAll: async function (req, res) {
    res.ok(await ModmailConv.find({}).populate('messages').populate('actions'));
    //res.ok("ok");
//await ModmailConv.update('347q0').set({messages: ['51hqv','51hqo']});
    /*
    ModmailConv.findOne('347q0')
    .exec(function(err,user){ 
      user.messages.add = (ModmailMsg.findOne('51hqv'))._id;
      user.messages.add = (ModmailMsg.findOne('51hqo'))._id;
      user.save();
    })*/
    //res.ok("ok");
  },




};
