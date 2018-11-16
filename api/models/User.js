/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  types: {
    friendCodeFormat: function (codes) {
      for (var code in codes) {
        var patt = /(?:SW-)?([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
        if (!patt.test(codes[code])) {
          return false;
        }
      }
      return true;
    }
  },

  autoPK: false,

  attributes: {
    provider: 'STRING',
    name: {
      type: "string",
      columnName: 'id',
      unique: true,
      primaryKey: true
    },
    email: "string",
    firstname: "string",
    lastname: "string",
    intro: {
      type: "text",
      maxLength: 10000
    },
    friendCodes: {
      type: "array",
      friendCodeFormat: true
    },
    loggedFriendCodes: {
      type: "array",
      friendCodeFormat: true
    },
    isMod: "boolean",
    modPermissions: {
      type: "array",
      defaultsTo: null
    },
    banned: "boolean",
    redToken: "string",
    flair: "json"
  }
};
