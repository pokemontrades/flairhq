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
        var patt = /([0-9]{4})(-?)(?:([0-9]{4})\2)([0-9]{4})/;
          if (!patt.test(fc)) {
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
