/**
* Reference.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    user: "string",
    ign: "string",
    tsv: {
      type: "number",
      max: 4095,
      min: -1
    }
  }
};

