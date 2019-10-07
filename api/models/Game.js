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
      type: "string",
      custom: (val) => !isNaN(val) && Number(val) > -1 && Number(val) <= 4095
    }
  }
};

