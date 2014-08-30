/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  adapter: 'mongo',

  types: {
    friendCodeFormat: function (codes) {
      for (code in codes) {
        if (codes[code].length !== 12) {
          return false;
        }
        if (isNaN(parseFloat(codes[code])) || !isFinite(codes[code])) {
          return false;
        }
      }
      return true;
    }
  },

  attributes: {
    provider: 'STRING',
    uid: "string",
    name: "string",
    email: "string",
    firstname: "string",
    lastname: "string",
    intro: "text",
    friendCodes: {
      type: "array",
      friendCodeFormat: true
    }
  }
};
