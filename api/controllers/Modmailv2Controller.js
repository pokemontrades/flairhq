/**
 * NewModmailController
 *
 * @description :: Server-side logic for managing Modmails
 */

var refreshToken = sails.config.reddit.adminRefreshToken;
var _ = require('lodash');

module.exports = {

  getAll: async function (req, res) {
    req.params = req.allParams();

    let convProperties = Object.getOwnPropertyNames(ModmailConv.attributes);
    convProperties.splice(convProperties.indexOf('createdAt'),1)
    convProperties.splice(convProperties.indexOf('modifiedAt'),1)

    let msgProperties = Object.getOwnPropertyNames(ModmailMsg.attributes);
    msgProperties.splice(msgProperties.indexOf('createdAt'),1)
    msgProperties.splice(msgProperties.indexOf('modifiedAt'),1)

    let actionProperties = Object.getOwnPropertyNames(ModmailAction.attributes);
    actionProperties.splice(actionProperties.indexOf('createdAt'),1)
    actionProperties.splice(actionProperties.indexOf('modifiedAt'),1)

    let allResults = await Reddit.getNewModmail(refreshToken, ['pokemontrades','svexchange'], '347q1', 'mod');
    let allConversations = allResults[0].map(element => {
      return _.pick(element.conversation, convProperties); // add ConvID
    });
    let allMessages = allResults[0].map(element => {
      return _.pick(element.messages[Object.keys(element.messages)[0]], msgProperties); // add ConvID
    });     
    let allActions = allResults[0].map(element => {
      element.map(entry => {
        return _.pick(element.modActions[Object.keys(element.modActions)[0]], actionProperties); //to be fixed
      })
      return _.pick(element.modActions[Object.keys(element.modActions)[0]], actionProperties); //to be fixed
    });   
    sails.log(allActions);
    res.ok(allResults);
  }
};
