/**
 * Team.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  autoPK: false,
  attributes: {
    team: {
      type: "string",
      columnName: 'id',
      enum: ['kanto', 'alola'],
      primaryKey: true
    },
    members: {
      type: "array"
    },
    membershipPoints: {
      type: "integer"
    },
    battlePoints: {
      type: "integer"
    },
    contestPoints: {
      type: "integer"
    },
    triviaPoints: {
      type: "integer"
    }
  }
};
