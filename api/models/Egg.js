/**
* Egg.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var base = require('./Reference.js'),
    _ = require('lodash');

module.exports = _.merge(_.cloneDeep(base), {

  attributes: {
    description: "string",
    type: {
      type: "string",
      enum: ["egg"],
      defaultsTo: "egg"
    }
  }
});

