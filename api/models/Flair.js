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
      type: "number",
      defaultsTo: 0
    },
    involvement: {
      type: "number",
      defaultsTo: 0
    },
    eggs: {
      type: "number",
      defaultsTo: 0
    },
    giveaways: {
      type: "number",
      defaultsTo: 0
    }
  }
};

