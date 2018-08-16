/**
 * NewModmailController
 *
 * @description :: Server-side logic for managing Modmails
 */

var refreshToken = sails.config.reddit.adminRefreshToken;
var _ = require('lodash');

module.exports = {
// need to fix date format
  getAll: async function (req, res) {
    req.params = req.allParams();
    let allResults = await Reddit.getNewModmail(refreshToken, ['pokemontrades','svexchange'], '347q1', 'all');
    let allConversations = allResults[0].map(element => {
      let filteredElement = {};
      let elementConv = element.conversation;
      ["objIds", "lastUpdated", "isInternal", "id", "subject", "state", "subreddit"].forEach(function (p) {
        filteredElement[p] = elementConv[p];
      });
      filteredElement["subreddit"] = elementConv.owner.displayName;
      return filteredElement;
    });
  
    let allMessages = [].concat.apply([], allResults[0].map(element => {
      let convID = element.conversation.id;
      let entries = Object.keys(element.messages);
      let elementMsg = element.messages;
      return entries.map(entry => {
        let filteredElement = {};
        let currentElementMsg = elementMsg[entry];
        ["isInternal", "date", "bodyMarkdown", "id"].forEach(function (p) {
          filteredElement[p] = currentElementMsg[p];
        });
        filteredElement["author"] = currentElementMsg.author.name;
        filteredElement["conversationId"] = convID;
        return filteredElement;
        });
    })); 
  
    let allActions = [].concat.apply([], allResults[0]
      .filter( element => {
        return Object.keys(element.modActions).length !== 0;
      })
      .map(element => {
      let convID = element.conversation.id;
      let entries = Object.keys(element.modActions);
      let elementAction = element.modActions;
      return entries.map(entry => {
        let filteredElement = {};
        let currentElementAction = elementAction[entry];
        ["date", "actionTypeId", "id"].forEach(function (p) {
          filteredElement[p] = currentElementAction[p];
        });
        filteredElement["author"] = currentElementAction.author.name;
        filteredElement["conversationId"] = convID;
        return filteredElement;
        });
    })); 

    let convAdd   = await ModmailConv.findOrCreate(allConversations).catch( e => {console.log(e)});
    /*let msgAdd    = await ModmailMsg.findOrCreate(allMessages);
    let actionAdd = await ModmailAction.findOrCreate(allActions);*/

    res.ok(allConversations,allMessages,allActions);
  }
};
