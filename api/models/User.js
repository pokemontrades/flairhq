/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const friendCodeFormat = function (codes) {
  for (var code in codes) {
    var patt = /(?:SW-)?([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
    if (!patt.test(codes[code])) {
      return false;
    }
  }
  return true;
}

module.exports = {

  attributes: {
    provider: 'STRING',
    name: {
      type: "string",
      unique: true,
    },
    email: "string",
    firstname: "string",
    lastname: "string",
    intro: {
      type: "string",
      maxLength: 10000
    },
    friendCodes: {
      type: "string",
      columnType: "array",
      custom: friendCodeFormat
    },
    loggedFriendCodes: {
      type: "string",
      columnType: "array",
      custom: friendCodeFormat
    },
    isMod: "boolean",
    modPermissions: {
      type: "string",
      columnType: "array",
      allowNull: true
    },
    banned: "boolean",
    redToken: "string",
    flair: "json"
  }
};
