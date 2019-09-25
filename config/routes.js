"use strict";
/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'get /api/user/get/:name' : {
    controller : 'user',
    action     : 'get'
  },

  'post /api/user/addNote' : {
    controller : 'user',
    action     : 'addNote'
  },

  'post /api/user/delNote' : {
    controller : 'user',
    action     : 'delNote'
  },

  'get /logout' : {
    controller : 'auth',
    action     : 'logout'
  },

  'get /api/auth/reddit': {
    controller: 'auth',
    action: 'reddit'
  },

  'get /api/auth/reddit/callback' : {
    controller : 'auth',
    action     : 'callback'
  },

  'post /api/reference/add' : {
    controller : 'reference',
    action     : 'add'
  },

  'post /api/reference/edit' : {
    controller : 'reference',
    action     : 'edit'
  },

  'post /api/reference/approve' : {
    controller : 'reference',
    action     : 'approve'
  },

  'post /api/reference/approve/all' : {
    controller : 'reference',
    action     : 'approveAll'
  },

  'post /api/reference/delete' : {
    controller : 'reference',
    action     : 'deleteRef'
  },

  'post /api/reference/comment/add' : {
    controller : 'reference',
    action     : 'comment'
  },

  'post /api/reference/comment/del' : {
    controller : 'reference',
    action     : 'delComment'
  },

  'get /api/flair/all' : {
    controller : 'reference',
    action     : 'getFlairs'
  },

  'post /api/flair/save' : {
    controller : 'reference',
    action     : 'saveFlairs'
  },

  'post /api/flair/apply' : {
    controller : 'flair',
    action     : 'apply'
  },

  'get /api/flair/apps/all' : {
    controller : 'flair',
    action     : 'getApps'
  },

  'post /api/flair/app/approve' :{
    controller : 'flair',
    action     : 'approveApp'
  },

  'post /api/flair/app/deny' :{
    controller : 'flair',
    action     : 'denyApp'
  },

  'post /api/flair/app/refreshClaim': {
    controller: 'flair',
    action: 'refreshClaim'
  },

  'post /api/flair/setText': {
    controller: 'flair',
    action: 'setText'
  },

  'post /api/user/edit' : {
    controller : 'user',
    action     : 'edit'
  },

  'post /api/user/ban' : {
    controller : 'user',
    action     : 'ban'
  },

  'post /api/mod/setlocalban' : {
    controller : 'user',
    action     : 'setLocalBan'
  },

  'get /api/user/banned' : {
    controller : 'user',
    action     : 'bannedUsers'
  },

  'post /api/clearsession/:name' : {
    controller : 'user',
    action     : 'clearSession'
  },

  'get /api/event/get': {
    controller: 'event',
    action: 'get'
  },

  'get /api/version' : {
    controller : 'home',
    action     : 'version'
  },
  
  'get /api/discord' : {
    controller : 'home',
    action     : 'discord'
  },
  
  'get /api/discord/callback' : {
    controller  : 'auth',
    action      : 'discordCallback'
  },

  "/*": {
    controller  : 'home',
    action      : 'ui', 
    skipAssets: true
  }
};

var searchTypes = require("../ui/search/types.js");

for (let i = 0; i < searchTypes.length; i++) {
  // Programatically add the routes for searches
  let type = searchTypes[i];
  module.exports.routes['get /search/' + type.short] = {
    controller: 'search',
    action: type.short
  };
}
