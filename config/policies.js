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

  '*': ['passport', 'sessionAuth'],

  'auth': {
    '*': 'passport'
  },

  EventController: {
    '*': ['passport', 'sessionAuth', 'isMod']
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
    '*': ['passport', 'sessionAuth'],
    all: ['passport', 'sessionAuth', 'isMod'],
    approve: ['passport', 'sessionAuth', 'isMod'],
    approveAll: ['passport', 'sessionAuth', 'isMod'],
    saveFlairs: ['passport', 'sessionAuth', 'isMod']
  },

  UserController: {
    '*': ['passport', 'sessionAuth', 'isMod'],
    edit: ['passport', 'sessionAuth'],
    mine: ['passport', 'sessionAuth'],
    get: ['passport']
  }
};
