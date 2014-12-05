/**
* Reference.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    url: {
      type: "string"
    },
    user: "string",
    user2: "string",
    gave: "string",
    got: "string",
    description: "string",
    number: {
      type: "integer",
      required: false
    },
    type: {
      type: "string",
      enum: [
        "event",
        "redemption",
        "shiny",
        "casual",
        "bank",
        "egg",
        "giveaway",
        "eggcheck",
        "misc"
      ]
    },
    // This defines whether the other user has added the same url
    verified: "boolean",
    // This defines if the mods have approved it as a trade that can count
    approved: "boolean",
    notes: "string"
  }
};

