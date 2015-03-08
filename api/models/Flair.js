/**
* Flair.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: "string",
    sub: "string",

    trades: {
      type: "integer",
      defaultsTo: 0
    },
    involvement: {
      type: "integer",
      defaultsTo: 0
    },
    eggs: {
      type: "integer",
      defaultsTo: 0
    },
    giveaways: {
      type: "integer",
      defaultsTo: 0
    }
  }
};

