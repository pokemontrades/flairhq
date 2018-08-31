/**
* ModmailConv.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    objIds: 'json', // all messages and mod actions
    messages: {
      collection: 'ModmailMsg',
      via: 'id'
    },
    actions: {
      collection: 'ModmailAction',
    },
    lastUpdated: 'string', // last mod or user update
    isInternal: 'boolean',
    id: { // base36id of the conversation
      columnName: 'id',
      type: 'string',
      unique: true,
      primaryKey: true
    },
    subject: 'string',
    state: { // 0 - new, 1 - in progress, 2 - archived
      enum: ['0', '1', '2']
    },
    subreddit: { //The subreddit that the modmail was sent to
      enum: ['pokemontrades', 'svexchange']
    },
    
    // Not needed
    //isAuto: 'boolean',    
    //isRepliable: 'boolean',
    //lastUserUpdate: 'integer',
    //lastModUpdate: 'integer',
    //authors: '',
    //owner: '',
    //isHighlighted: 'boolean',
    //participant: '',
    //lastUnread: '',
    //numMessages: 'integer'
  }
};
