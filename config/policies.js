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


module.exports.policies = {

  '*': ['passport', 'sessionAuth', 'isMod'],

  AuthController: {
    '*': 'passport'
  },

  FlairController: {
    '*': ['passport', 'sessionAuth', 'isMod'],
    apply: ['passport', 'sessionAuth'],
    setText: ['passport', 'sessionAuth']
  },

  HomeController: {
    '*': ['passport', 'sessionAuth', 'isMod'],
    index: ['passport', 'sessionAuth'],
    reference: ['passport'],
    search: ['passport', 'sessionAuth'],
    info: ['passport']
  },

  ReferenceController: {
    '*': ['passport', 'sessionAuth', 'isMod'],
    get: ['passport', 'sessionAuth'],
    add: ['passport', 'sessionAuth'],
    edit: ['passport', 'sessionAuth'],
    deleteRef: ['passport', 'sessionAuth'],
    comment: ['passport', 'sessionAuth'],
    delComment: ['passport', 'sessionAuth'],
    getFlair: ['passport', 'sessionAuth']
  },

  SearchController: {
    '*': ['passport', 'sessionAuth']
  },

  UserController: {
    '*': ['passport', 'sessionAuth', 'isMod'],
    edit: ['passport', 'sessionAuth'],
    mine: ['passport', 'sessionAuth'],
    get: 'passport'
  }
};
