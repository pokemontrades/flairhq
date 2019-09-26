/**
 * Team.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    id: {
      type: "string",
      isIn: ['kanto', 'alola'],
    },
    members: {
      type: "json"
    },
    membershipPoints: {
      type: "number"
    },
    battlePoints: {
      type: "number"
    },
    contestPoints: {
      type: "number"
    },
    triviaPoints: {
      type: "number"
    }
  }
};
