/**
* Notification.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    user: "string",
    type: {
      type: "string",
      enum: [
        "comment",
        "flairApproval",
        "flairDenial",
        "newPossibleFlair"
      ]
    },
    content: "string",
    read: "boolean"
  }
};

