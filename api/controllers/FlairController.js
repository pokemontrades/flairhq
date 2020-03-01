/* global module, Application, User, Reddit */
var moment = require('moment');
var refreshToken = sails.config.reddit.adminRefreshToken;
var _ = require("lodash");

// Mappings from css_flair to emoji names
var flair_mappings = {
  "default" : ":0:",
  "gen2" : ":2:",
  "pokeball" : ":10:",
  "premierball" : ":20:",
  "greatball" : ":30:",
  "ultraball" : ":40:",
  "luxuryball" : ":50:",
  "masterball" : ":60:",
  "dreamball" : ":70:",
  "cherishball" : ":80:",
  "ovalcharm" : ":90:",
  "shinycharm" : ":100:",
  "gsball" : ":GS:"
};    

module.exports = {
    
  apply: async function (req, res) {
    try {
      var allFlairs = await Flair.find();
      var userRefs = await Reference.find({user: req.user.name});
      var appData = {user: req.user.name, flair: req.allParams().flair, sub: req.allParams().sub};
      if (await Application.findOne(appData)) {
        return res.status(400).json({error: 'You have already applied for that flair'});
      }
      var flairIndex = allFlairs.map(function (flairObj) {
        return flairObj.name;
      }).indexOf(req.allParams().flair);
      if (flairIndex === -1) {
        return res.status(400).json({error: 'That flair does not exist'});
      }
      var applicationFlair = allFlairs[flairIndex];
      if (!Flairs.canUserApply(userRefs, applicationFlair, Flairs.getUserFlairs(req.user, allFlairs))) {
        return res.status(400).json({error: 'You do not qualify for that flair'});
      }
      return res.ok(await Application.create(appData));
    } catch (err) {
      return res.serverError(err);
    }
  },

  denyApp: async function (req, res) {
    try {
      var matching_apps = await Application.destroy(req.allParams().id);
      var apps = await Flairs.getApps();
      if (!matching_apps.length) {
        return res.status(404).json(apps);
      }
      return res.ok(apps);
    } catch (err) {
      return res.serverError(err);
    }
  },

  approveApp: async function (req, res) {
    try {
      var app = await Application.findOne(req.allParams().id);
      if (!app) {
        return res.status(404).json(await Flairs.getApps());
      }
      var user = await User.findOne(app.user);
      var shortened = app.sub === 'pokemontrades' ? 'ptrades' : 'svex';
      var css_flair = Flairs.makeNewCSSClass(_.get(user, 'flair.' + shortened + '.flair_css_class') || '', app.flair, app.sub);
      user.flair[shortened].flair_css_class = css_flair;        

      // Grab flair text and split by spaces to swap out emoji text
      var flair_text = '';
      if (shortened === 'ptrades') {
        var flair_arr = user.flair[shortened].flair_text.split(' ');
          
        // Check to see if user has flair with emoji. If not, insert emoji
        var emoji = flair_arr[0];
        var newEmoji = flair_mappings[css_flair];
        if (emoji.indexOf(':') === -1) {
          flair_arr.splice(0, 0, newEmoji);
        } else {
          /*
          If the app is for involvement, add i to the emoji text.
          Otherwise, check for involvement flair (otherwise map won't work).
          If they have involvement flair, adjust key. Otherwise, just use the map to grab the correct emoji.
          */
          if (app.flair === 'involvement') {
            emoji = emoji.slice(0, emoji.length - 1) + 'i:';
            console.log(emoji);
          } else {
            if (css_flair.indexOf('1') !== -1) { 
              emoji = flair_mappings[css_flair.slice(0,-1)];
              emoji = emoji.slice(0, -1) + 'i:';
            } else {
              emoji = newEmoji;
            }
          }
          flair_arr[0] = emoji;
        }
      }
      flair_text = flair_arr.join(' ');
      
      await Reddit.setUserFlair(req.user.redToken, user.name, css_flair, flair_text, app.sub);
      var promises = [];
      promises.push(user.save());
      promises.push(Event.create({type: "flairTextChange", user: req.user.name,content: "Changed " + user.name + "'s flair to " + css_flair}));
      var pmContent = 'Your application for ' + Flairs.formattedName(app.flair) + ' flair on /r/' + app.sub + ' has been approved.';
      promises.push(Reddit.sendPrivateMessage(refreshToken, 'FlairHQ Notification', pmContent, user.name));
      promises.push(Application.destroy({id: req.allParams().id}));
      await* promises;
      sails.log.info("/u/" + req.user.name + ": Changed " + user.name + "'s flair to " + css_flair);
      
      return res.ok(await Flairs.getApps());
    } catch (err) {
      return res.serverError(err);
    }
  },

  setText: async function (req, res) {
    var flairs;
    try {
      flairs = Flairs.flairCheck(req.allParams().ptrades, req.allParams().svex);
    } catch (e) {
      return res.status(400).json({error: e});
    }
    try {
      var appData = {
        limit: 1,
        sort: "createdAt DESC",
        user: req.user.name,
        type: "flairTextChange"
      };
      var events = await Event.find(appData);
      var now = moment();
      if (events.length) {
        var then = moment(events[0].createdAt);
        then.add(2, 'minutes');
        if (then.isAfter(now)) {
          return res.status(400).json({error: "You set your flair too recently, please try again in a few minutes."});
        }
      }

      var blockReport = _.isEqual(flairs.fcs, req.user.loggedFriendCodes.slice(0, flairs.fcs.length));

      var flagged = _.reject(flairs.fcs, Flairs.validFC);
      var ipAddress = req.headers['x-forwarded-for'] || req.ip;
      // Get IP matches with banned users
      var events_with_ip = await Event.find({content: {contains: ipAddress}, user: {not: req.user.name}});

      var matching_ip_usernames = _.uniq(_.map(events_with_ip, 'user'));
      var matching_ip_users = await User.find({name: matching_ip_usernames});
      var matching_ip_banned_users = matching_ip_users.filter(user => user.banned);

      var ignoredAlts = ['0000-0000-0000', '1111-1111-1111'];
      var users_with_matching_fcs = await User.find({loggedFriendCodes: flairs.fcs.filter((fc) => !ignoredAlts.includes(fc)), name: {not: req.user.name}});
      var logged_fcs = _.flatten(_.map(users_with_matching_fcs, 'loggedFriendCodes'));
      var matching_friend_codes = _.intersection(flairs.fcs, logged_fcs);
      var matching_fc_usernames = _.map(users_with_matching_fcs, 'name');

      // Get friend codes that are similar (have a low edit distance) to banned friend codes
      var similar_banned_fcs = _.flatten(await* flairs.fcs.map(Flairs.getSimilarBannedFCs));
      // Get friend codes that are identical to banned users' friend codes
      var identical_banned_fcs = _.intersection(flairs.fcs, similar_banned_fcs);

      var friend_codes = _.union(flairs.fcs, req.user.loggedFriendCodes);

      var pFlair = _.get(req, "user.flair.ptrades.flair_css_class") || "default";
      var svFlair = _.get(req, "user.flair.svex.flair_css_class") || "";
      svFlair = svFlair.replace(/2/, "");
      
      // For safety, remove all colons from flair and reset emoji.
      var flair_text = flairs.ptrades.replace(/:/g, "");
      var flair_arr = flair_text.split(' ');
      var emoji = '';
      if (pFlair.indexOf(1) !== -1) {
        var noInvolvement = pFlair.slice(0,-1);
        emoji += flair_mappings[noInvolvement].slice(0, -1) + 'i:';    
      } else {
        emoji += flair_mappings[pFlair];
      }
      flair_arr[0] = emoji;
      flair_text = flair_arr.join(' ');
      
      var promises = [];
      var eventFlair = null; // Change to req.allParams().eventFlair during events

      if (eventFlair) {
        if (_.includes(Flairs.eventFlair, eventFlair) && !(pFlair.match(Flairs.eventFlairRegExp))) {
          let team = await Team.find({"members": req.user.name});
          if (team.length) {
            return res.status(400).json({error: "You have already selected a starter!"});
          }
          req.user.team = _.includes(Flairs.kantoFlair, eventFlair) ? "kanto" : "alola";
          pFlair = Flairs.makeNewCSSClass(pFlair, `kva-${eventFlair}-1`, "PokemonTrades");
          module.exports.addMembershipPoints(req, res, "add").then(() => {
            promises.push(Reddit.setUserFlair(refreshToken, req.user.name, pFlair, flair_text, "PokemonTrades").catch((err) => {
              sails.log.warn(`Reverting team ${req.user.team} join for ${req.user.name} due to the following error:`);
              sails.log.warn(err);
              module.exports.addMembershipPoints(req, res, "remove");
              throw err;
            }));
          });
        } else {
          return res.status(400).json({error: "Unexpected extra flair."});
        }
      } else {
        promises.push(Reddit.setUserFlair(refreshToken, req.user.name, pFlair, flair_text, "PokemonTrades"));
      }
      promises.push(Reddit.setUserFlair(refreshToken, req.user.name, svFlair, flairs.svex, "SVExchange"));
      promises.push(User.update({name: req.user.name}, {loggedFriendCodes: friend_codes}));

      if (!blockReport && (users_with_matching_fcs.length !== 0 || matching_ip_usernames.length !== 0 || flagged.length)) {
        var message = 'The user /u/' + req.user.name + ' set the following flairs:\n\n' + flair_text + '\n\n' + flairs.svex + '\n\n';
        if (users_with_matching_fcs.length !== 0) {
          message += 'This flair contains a friend code that matches ' + '/u/' + matching_fc_usernames.join(', /u/') + '\'s friend code: ' + matching_friend_codes + '\n\n';
          var altNote = "Alt of " + matching_fc_usernames;
          promises.push(Usernotes.addUsernote(refreshToken, 'FlairHQ', 'pokemontrades', req.user.name, altNote, 'spamwarn', ''));
          var otherAltNote = "Alt of " + req.user.name;
          promises.push(Usernotes.addUsernote(refreshToken, 'FlairHQ', 'pokemontrades', matching_fc_usernames, otherAltNote, 'spamwarn', ''));
          if (identical_banned_fcs.length) {
            message += '**This flair contains a banned friend code: ' + identical_banned_fcs + '**\n\n';
          } else if (flagged.length && similar_banned_fcs.length) {
            message += '**This flair contains a friend code similar to the following banned friend code' + (  similar_banned_fcs.length > 1 ? 's: ' : ': ') + similar_banned_fcs.join(', ') + '**\n\n';
          }
        }
        if (matching_ip_usernames.length !== 0) {
          message += 'This user may be an alt of the user' + (matching_ip_usernames.length === 1 ? '' : 's') + ' /u/' + matching_ip_usernames.join(', /u/') + '.\n\n';
          promises.push(Usernotes.addUsernote(refreshToken, 'FlairHQ', 'pokemontrades', req.user.name, altNote, 'spamwarn', ''));
          promises.push(Usernotes.addUsernote(refreshToken, 'FlairHQ', 'pokemontrades', matching_fc_usernames, otherAltNote, 'spamwarn', ''));
          if (matching_ip_banned_users.length) {
            message += '**' + '/u/' + matching_ip_banned_users.map(user => user.name).join(', /u/') + ' is banned.**\n\n';
          }
        }
        if (flagged.length) {
          message += 'The friend code' + (flagged.length === 1 ? ' ' + flagged + ' is' : 's ' + flagged.join(', ') + ' are') + ' invalid.\n\n';
          var formattedNote = "Invalid friend code" + (flagged.length == 1 ? "" : "s") + ": " + flagged.join(', ');
          promises.push(Usernotes.addUsernote(refreshToken, 'FlairHQ', 'pokemontrades', req.user.name, formattedNote, 'spamwarn', ''));
        }
        message = message.slice(0,-2);
        
        promises.push(Reddit.sendPrivateMessage(refreshToken, "FlairHQ notification", message, "/r/pokemontrades"));
        
      }
      Promise.all(promises).then(function () {
        Event.create([{
          type: "flairTextChange",
          user: req.user.name,
          content: "Changed PokemonTrades flair text to: " + req.allParams().ptrades + ". IP: " + ipAddress
        }, {
          type: "flairTextChange",
          user: req.user.name,
          content: "Changed SVExchange flair text to: " + req.allParams().svex + ". IP: " + ipAddress
        }]).exec(function () {});
        User.native(function(err, collection) {
          collection.update({"_id": req.user.name}, {
            $set:{
              "flair.ptrades.flair_text": flair_text,
              "flair.ptrades.flair_css_class": pFlair,
              "flair.svex.flair_text": flairs.svex,
              "flair.svex.flair_css_class": svFlair
            }
          });
        });
        
        return res.ok();
      });
      
    } catch (err) {
      return res.serverError(err);
    }
  },

  getApps: async function (req, res) {
    try {
      return res.ok(await Flairs.getApps());
    } catch (err) {
      return res.serverError(err);
    }
  },

  refreshClaim: async function (req, res) {
    try {
      await Flairs.refreshAppClaim(req.allParams(), req.user.name);
      return res.ok();
    } catch (err) {
      return res.serverError(err);
    }
  },

  addMembershipPoints: async function (req, res, action) {

    try {
      var promises = [];

      promises.push(PointLog.create({
        time: new Date(),
        team: req.user.team,
        from: req.user.name,
        pointType: "membershipPoints",
        reason: action === "add" ? "Joined team" : "Reverted join",
        points: action === "add" ? 1 : -1
      }));

      promises.push(Team.native(function(err, collection) {
        collection.update(
          {"_id": req.user.team},
          action === "add" ? {$push: {"members": req.user.name}, $inc: {"membershipPoints": 1}} : {$pull: {"members": req.user.name}, $inc: {"membershipPoints": -1}}
        );
      }));

      if (action === "remove") {
        promises.push(ContestStats.native(function(err, collection) {
          collection.deleteOne({
            _id: req.user.name
          });
        }));
      } else {
        promises.push(ContestStats.create({
          user: req.user.name,
          expPoints: 1,
          battleWins: 0
        }));
      }

      await* promises;

    } catch (err) {
      return res.serverError(err);
    }

  }
};
