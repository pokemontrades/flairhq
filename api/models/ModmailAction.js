/**
* ModmailAction.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    date: 'integer',
    actionTypeId: { // 0 - highlight, 1 - un-highlight, 2 - archive, 3 -	un-archive, 4 -reported to admins, 5 - mute, 6 - un-mute
      enum: ['0', '1', '2', '3', '4', '5', '6']
    },
    id: {
      columnName: 'id',
      type: 'string',
      unique: true,
      primaryKey: true
    },
    author: 'string', // author.name
    conversationId: 'string'
  }
};
