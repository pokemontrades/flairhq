/**
* Reference.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    user: "string",
    IGN: "string",
    TSV: {
      type: "int",
      max: 4095,
      min: 0,
      numeric: true
    }
  }
};

