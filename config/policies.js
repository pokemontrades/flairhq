/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */

var mod = ['passport', 'sessionAuth', 'isMod'];
var user = ['passport', 'sessionAuth'];
var anyone = ['passport'];

module.exports.policies = {

  '*': mod,

  AuthController: {
    '*': anyone
  },

  FlairController: {
    '*': mod,
    apply: user,
    setText: user
  },

  HomeController: {
    '*': mod,
    index: user,
    reference: anyone,
    search: user,
    info: anyone
  },

  ReferenceController: {
    '*': mod,
    get: user,
    add: user,
    edit: user,
    deleteRef: user,
    comment: user,
    delComment: user,
    getFlairs: user
  },

  SearchController: {
    '*': mod,
    ref: user,
    refView: user
  },

  UserController: {
    '*': mod,
    edit: user,
    mine: user,
    get: anyone
  }
};
