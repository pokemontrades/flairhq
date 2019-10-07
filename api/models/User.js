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
    email: "string",
    firstname: "string",
    lastname: "string",
    intro: {
      type: "string",
      maxLength: 10000
    },
    friendCodes: {
      type: "json",
      custom: friendCodeFormat
    },
    loggedFriendCodes: {
      type: "json",
      custom: friendCodeFormat
    },
    isMod: "boolean",
    modPermissions: {
      type: "json"
    },
    banned: {
      type: "boolean",
      allowNull: true
    },
    redToken: "string",
    flair: "json"
  }
};
