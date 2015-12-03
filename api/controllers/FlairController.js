/* global module, Application, User, Reddit */
var moment = require('moment');
var refreshToken = sails.config.reddit.adminRefreshToken;
var _ = require("lodash");

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

  denyApp: function (req, res) {
    Application.destroy(req.allParams().id).exec(function (err, results) {
      if (err) {
        return res.serverError(err);
      }
      return res.ok(results);
    });
  },

  approveApp: function (req, res) {
    Application.findOne(req.allParams().id).exec(function (err, app) {
      if (!app) {
        return res.notFound("Application not found.");
      }
      User.findOne({name: app.user}).exec(function (err, user) {
        if (err) {
          return res.serverError(err);
        }
        var formatted = Flairs.formattedName(app.flair);
        var flair,
          css_class;
        if (app.sub === "pokemontrades" && user.flair.ptrades) {
          flair = user.flair.ptrades.flair_text;
          css_class = user.flair.ptrades.flair_css_class;
        } else if (app.sub === "svexchange" && user.flair.svex) {
          flair = user.flair.svex.flair_text;
          css_class = user.flair.svex.flair_css_class;
        }
        if (app.flair === "involvement" && css_class && css_class.indexOf("1") === -1) {
          app.flair = user.flair.ptrades.flair_css_class + "1";
        } else if (app.flair === "involvement") {
          app.flair = user.flair.ptrades.flair_css_class;
        } else if (css_class && css_class.indexOf("1") > -1) {
          app.flair += "1";
        }
        if (css_class && css_class.slice(-1) === "2") {
          app.flair += "2";
        }
        if (css_class && css_class.indexOf(' ') > -1) {
          if (app.flair.indexOf('ribbon') > -1) {
            css_class = css_class.substr(0, css_class.indexOf(' ')) + " " + app.flair;
          } else {
            css_class = app.flair + " " + css_class.substr(css_class.indexOf(' ') + 1);
          }
        } else {
          if (app.flair.indexOf('ribbon') > -1 && css_class && css_class.indexOf('ribbon') === -1) {
            css_class = css_class + " " + app.flair;
          } else if (app.flair.indexOf('ribbon') === -1 && css_class && css_class.indexOf('ribbon') > -1) {
            css_class = app.flair + " " + css_class;
          } else {
            css_class = app.flair;
          }
        }
        Reddit.setUserFlair(req.user.redToken, user.name, css_class, flair, app.sub).then(function () {
          Event.create({
            type: "flairTextChange",
            user: req.user.name,
            content: "Changed " + user.name + "'s flair to " + css_class
          }).exec(function () {
          });

          console.log("/u/" + req.user.name + ": Changed " + user.name + "'s flair to " + css_class);
          Reddit.sendPrivateMessage(
            refreshToken,
            'FlairHQ Notification',
            'Your application for ' + formatted + ' flair on /r/' + app.sub + ' has been approved.',
            user.name).then(undefined, function () {
              console.log('Failed to send a confirmation PM to ' + user.name);
            }
          );
          if (app.sub === 'pokemontrades') {
            user.flair.ptrades.flair_css_class = css_class;
          } else {
            user.flair.svex.flair_css_class = css_class;
          }
          user.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
          Application.destroy({id: req.allParams().id}).exec(function (err, app) {
            if (err) {
              return res.serverError(err);
            }
            return res.ok(app);
          });
        }, function (err) {
          return res.serverError(err);
        });
      });
    });
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
        limit: 2,
        sort: "createdAt DESC",
        user: req.user.name,
        type: "flairTextChange"
      };
      var events = await Event.find(appData);
      var now = moment();
      if (events.length > 1) {
        var then = moment(events[0].createdAt);
        then.add(4, 'minutes');
        if (then.isAfter(now)) {
          return res.status(400).json({error: "You set your flair too recently, please try again in a few minutes."});
        }
      }

      var blockReport = _.isEqual(flairs.fcs, req.user.loggedFriendCodes.slice(0, flairs.fcs.length));

      var flagged = _.reject(flairs.fcs, Flairs.validFC);
      var ipAddress = req.headers['x-forwarded-for'] || req.ip;
      // Get IP matches with banned users
      var banned_alts = await Event.find({content: {contains: ipAddress}, user: {not: req.user.name}}).then(function (eventResults) {
        return User.find({name: _.uniq(_.map(eventResults, 'user')), banned: true});
      });
      // Get friend codes that are similar (have a low edit distance) to banned friend codes
      var similar_banned_fcs = _.flatten(await* flairs.fcs.map(Flairs.getSimilarBannedFCs));
      // Get friend codes that are identical to banned users' friend codes
      var identical_banned_fcs = _.intersection(flairs.fcs, similar_banned_fcs);
  
      var friend_codes = _.union(flairs.fcs, req.user.loggedFriendCodes);
      User.update({name: req.user.name}, {loggedFriendCodes: friend_codes}, function (err) {
        if (err) {
          console.log("Failed to update /u/" + req.user.name + "'s logged friend codes, for some reason");
          return;
        }
      });

      var newPFlair = _.get(req, "user.flair.ptrades.flair_css_class") || "default";
      var newsvFlair = _.get(req, "user.flair.svex.flair_css_class") || "";
      newsvFlair = newsvFlair.replace(/2/, "");
      var promises = [];
      promises.push(Reddit.setUserFlair(refreshToken, req.user.name, newPFlair, flairs.ptrades, "PokemonTrades"));
      promises.push(Reddit.setUserFlair(refreshToken, req.user.name, newsvFlair, flairs.svex, "SVExchange"));

      if (!blockReport && (identical_banned_fcs.length || similar_banned_fcs.length || banned_alts.length || flagged.length)) {
        var message = 'The user /u/' + req.user.name + ' set the following flairs:\n\n' + flairs.ptrades + '\n\n' + flairs.svex + '\n\n';
        if (identical_banned_fcs.length) {
          message += 'This flair contains a banned friend code: ' + identical_banned_fcs + '\n\n';
        } else if (flagged.length && similar_banned_fcs.length) {
          message += 'This flair contains a friend code similar to the following banned friend code'  + (similar_banned_fcs.length > 1 ? 's: ' : ': ') +
            similar_banned_fcs.join(', ') + '\n\n';
        }
        if (banned_alts.length) {
          message += 'This user may be an alt of the banned user' + (banned_alts.length === 1 ? '' : 's') + ' /u/' + banned_alts.join(', /u/') + '\n\n';
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
        return res.ok(req.user);
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
  }
};

