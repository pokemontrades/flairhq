/**
* ModmailMsg.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    author: 'string', // author.name
    isInternal: 'boolean',
    date: 'string',
    bodyMarkdown: 'string',
    id: {
      columnName: 'id',
      type: 'string',
      unique: true,
      primaryKey: true
    },
    conversationId: 'string'

    // Not needed
    //body: 'string',


  }
};
