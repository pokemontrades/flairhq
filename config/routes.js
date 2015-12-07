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

  '/' : {
    controller : 'home',
    action: 'index'
  },

  '/u/:user' : {
    controller: 'home',
    action: 'reference'
  },

  '/user/get/:name' : {
    controller : 'user',
    action     : 'get'
  },

  '/user/addNote' : {
    controller : 'user',
    action     : 'addNote'
  },

  '/user/delNote' : {
    controller : 'user',
    action     : 'delNote'
  },

  '/login' : {
    controller : 'auth',
    action     : 'index'
  },

  '/logout' : {
    controller : 'auth',
    action     : 'logout'
  },

  '/auth/reddit': {
    controller: 'auth',
    action: 'reddit'
  },

  '/auth/reddit/callback' : {
    controller : 'auth',
    action     : 'callback'
  },

  '/reference/add' : {
    controller : 'reference',
    action     : 'add'
  },

  '/reference/edit' : {
    controller : 'reference',
    action     : 'edit'
  },

  '/reference/approve' : {
    controller : 'reference',
    action     : 'approve'
  },

  '/reference/approve/all' : {
    controller : 'reference',
    action     : 'approveAll'
  },

  '/reference/delete' : {
    controller : 'reference',
    action     : 'deleteRef'
  },

  '/reference/comment/add' : {
    controller : 'reference',
    action     : 'comment'
  },

  '/reference/comment/del' : {
    controller : 'reference',
    action     : 'delComment'
  },

  '/flair/all' : {
    controller : 'reference',
    action     : 'getFlairs'
  },

  '/flair/save' : {
    controller : 'reference',
    action     : 'saveFlairs'
  },

  '/flair/apply' : {
    controller : 'flair',
    action     : 'apply'
  },

  '/flair/apps/all' : {
    controller : 'flair',
    action     : 'getApps'
  },

  '/flair/app/approve' :{
    controller : 'flair',
    action     : 'approveApp'
  },

  '/flair/app/deny' :{
    controller : 'flair',
    action     : 'denyApp'
  },

  '/flair/app/refreshClaim': {
    controller: 'flair',
    action: 'refreshClaim'
  },

  '/flair/setText': {
    controller: 'flair',
    action: 'setText'
  },

  '/user/edit' : {
    controller : 'user',
    action     : 'edit'
  },

  '/user/ban' : {
    controller : 'user',
    action     : 'ban'
  },

  '/mod/setlocalban' : {
    controller : 'user',
    action     : 'setLocalBan'
  },

  '/mod/banuser' : {
    controller  : 'home',
    action      : 'banuser'
  },
  '/user/banned' : {
    controller : 'user',
    action     : 'bannedUsers'
  },

  '/clearsession/:name' : {
    controller : 'user',
    action     : 'clearSession'
  },

  '/mod/applist' : {
    controller : 'home',
    action     : 'applist'
  },

  '/mod/banlist' : {
    controller : 'home',
    action     : 'banlist'
  },

  '/event/get': {
    controller: 'event',
    action: 'get'
  },

  '/info' : {
    controller : 'home',
    action     : 'info'
  },

  '/version' : {
    controller : 'home',
    action     : 'version'
  },

  '/mod/downloadModmail': {
    controller: 'user',
    action: 'downloadModmail'
  }
};

var searchTypes = require("../assets/search/types.js");

for (let i = 0; i < searchTypes.length; i++) {
  // Programatically add the routes for searches
  let type = searchTypes[i];
  module.exports.routes['/search/' + type.short] = {
    controller: 'search',
    action: type.short
  };
  module.exports.routes['/search/' + type.short + "/:searchterm"] = {
    controller: 'search',
    action: type.short + "View"
  };
}