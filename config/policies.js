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

const anyone = ['passport'];
const user = ['passport', 'sessionAuth'];
const flairMod = ['passport', 'sessionAuth', 'isFlairMod'];
const postMod = ['passport', 'sessionAuth', 'isPostMod'];
const admin = ['passport', 'sessionAuth', 'isAdmin'];

module.exports.policies = {

  '*': admin,

  AuthController: {
    '*': anyone
  },

  FlairController: {
    '*': admin,
    applist: flairMod,
    apply: user,
    setText: user,
    denyApp: flairMod,
    approveApp: flairMod
  },

  HomeController: {
    '*': admin,
    index: user,
    reference: anyone,
    search: user,
    info: anyone,
    tools: anyone,
    applist: flairMod,
    discord: user
  },

  ReferenceController: {
    '*': admin,
    get: user,
    add: user,
    edit: user,
    deleteRef: user,
    comment: user,
    delComment: user,
    approve: flairMod,
    approveAll: flairMod,
    saveFlairs: flairMod,
    getFlairs: user
  },

  SearchController: {
    '*': admin,
    ref: user,
    refView: user,
    user: user,
    userView: user
  },

  UserController: {
    '*': admin,
    edit: user,
    mine: user,
    get: anyone
  },
  
  ModNoteController: {
    '*': admin,
    find: postMod
  }
};
