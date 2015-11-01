exports.banFromSub = function (redToken, username, banMessage, banNote, subreddit, duration) {
  return new Promise(function(resolve, reject) {
    Reddit.banUser(
    redToken,
    username,
    banMessage,
    banNote,
    subreddit,
    duration,
    function (err) {
        if (err) {
          reject({error: 'Failed to ban user from /r/' + subreddit});
        } else {
          console.log('Banned ' + username + ' from /r/' + subreddit);
          resolve('Banned ' + username + ' from /r/' + subreddit);
        }
    });
  });
};

//Give the 'BANNED USER' flair on a subreddit
exports.giveBannedUserFlair = function (redToken, username, css_class, flair_text, subreddit) {
  return new Promise(function(resolve, reject) {
    Reddit.setFlair(
      redToken,
      username,
      css_class,
      flair_text,
      subreddit,
      function (err) {
        if (err) {
          reject({error: 'Failed to give banned user flair'});
        } else {
          console.log('Changed ' + username + '\'s flair to ' + css_class + ' on /r/' + subreddit);
          resolve('Changed ' + username + '\'s flair to ' + css_class + ' on /r/' + subreddit);
        }
      }
    );
  });
};
//Update the AutoModerator config with the user's friend codes
exports.updateAutomod = function (redToken, username, subreddit, friend_codes) {
  return new Promise(function(resolve, reject) {
    Reddit.getWikiPage(
      redToken,
      subreddit,
      'config/automoderator',
      function (err, current_config) {
        if (err) {
          reject({error: 'Error retrieving /r/' + subreddit + ' AutoModerator config'});
          return;
        }
        else {
          var lines = current_config.data.content_md.replace(/\r/g, '').split("\n");
          var fclist_indices = [lines.indexOf('#FCList1') + 1, lines.indexOf('#FCList2') + 1];
          if (fclist_indices.indexOf(0) != -1) {
            console.log(lines);
            console.log('Error: Could not find #FCList tags in /r/' + subreddit + ' AutoModerator config');
            reject({error: 'Error parsing /r/' + subreddit + ' AutoModerator config'});
            return;
          }
          try {
            for (var listno = 0; listno < fclist_indices.length; listno++) {
              var before_bracket = lines[fclist_indices[listno]].substring(0,lines[fclist_indices[listno]].lastIndexOf(']'));
              for (var i = 0; i < friend_codes.length; i++) {
                if (!friend_codes[i].match(/^(\d{4}-){2}\d{4}$/g)) {
                  reject({error: 'Invalid friend code: ' + friend_codes[i]});
                  return;
                }
                //Current automod regex: 0000\\D{0,3}0000\\D{0,3}0000
                var formatted;
                if (listno === 0) {
                  formatted = friend_codes[i].substring(0,4) + '\\\\D{0,3}' + friend_codes[i].substring(5,9) + '\\\\D{0,3}' + friend_codes[i].substring(10, 14);
                } else {
                  formatted = friend_codes[i];
                }
                before_bracket += ', "' + formatted + '"';
              }
              lines[fclist_indices[listno]] = before_bracket + ']';
            }
          }
          catch (automodparseerr) {
            console.log('Error parsing /r/' + subreddit + ' AutoModerator config');
            reject({error: 'Error parsing /r/' + subreddit + ' AutoModerator config'});
            return;
          }
          var content = lines.join("\n");
          Reddit.editWikiPage(
            redToken,
            subreddit,
            'config/automoderator',
            content,
            'FlairHQ: Updated banned friend codes',
            function (err, response) {
              if (err) {
                reject({error: 'Failed to update /r/' + subreddit + ' AutoModerator config'});
              } else {
                resolve('Added /u/' + username + '\'s friend codes to /r/' + subreddit + ' AutoModerator blacklist');
                console.log('Added /u/' + username + '\'s friend codes to /r/' + subreddit + ' AutoModerator blacklist');
              }
            }
          );
        }
      }
    );
  });
};
//Remove the user's TSV threads on /r/SVExchange.
exports.removeTSVThreads = function(redToken, username) {
  return new Promise(function(resolve, reject) {
    Reddit.searchTSVThreads(
      redToken,
      username,
      function (err, response) {
        if (err) {
          reject({error: 'Failed to search for user\'s TSV threads'});
        } else {
          var removeTSVPromises = [];
          response.data.children.forEach(function (entry) {
            removeTSVPromises.push(new Promise(function(resolve2, reject2) {
              Reddit.removePost(
                redToken,
                entry.data.id,
                'false',
                function (err) {
                  if (err) {
                    console.log(err);
                    reject2({error: 'Failed to remove the TSV thread at redd.it/' + entry.data.id});
                  } else {
                    resolve2('Removed the TSV thread at redd.it/' + entry.data.id);
                    console.log('Removed the TSV thread at redd.it/' + entry.data.id);
                  }
                }
              );
            }));
          });
          Promise.all(removeTSVPromises).then(function(result) {
            resolve('Removed /u/' + username + '\'s TSV threads (' + response.data.children.length.toString() + ' total)');
            console.log('Removed /u/' + username + '\'s TSV threads (' + response.data.children.length.toString() + ' total)');
          }, function(error) {
            reject(error);
          });
        }
      }
    );
  });
};
//Update the public banlist with the user's information
exports.updateBanlist = function (redToken, username, banlistEntry, friend_codes, igns) {
  return new Promise(function(resolve, reject) {
    Reddit.getWikiPage(
      redToken,
      'pokemontrades',
      'banlist',
      function (err, current_list) {
        if (err) {
          reject({error: 'Failed to retrieve current banlist'});
          return;
        }
        else {
          var lines = current_list.data.content_md.replace(/\r/g, '').split("\n");
          var start_index = lines.indexOf('[//]:# (BEGIN BANLIST)') + 3;
          if (start_index == 2) {
            console.log('Error: Could not find start marker in public banlist');
            reject({error: 'Error while parsing public banlist'});
            return;
          }
          var line_to_add = '/u/' + username + ' | ' + friend_codes.join(', ') + ' | ' + banlistEntry + ' | ' + igns;
          var content = lines.slice(0,start_index).join("\n") + "\n" + line_to_add + "\n" + lines.slice(start_index).join("\n");
          Reddit.editWikiPage(
            redToken,
            'pokemontrades',
            'banlist',
            content,
            '',
            function (err, response) {
              if (err) {
                console.log(err);
                reject({error: 'Failed to update public banlist'});
              } else {
                resolve('Added /u/' + username + ' to public banlist');
                console.log('Added /u/' + username + ' to public banlist');
              }
            }
          );
        }
      }
    );
  });
};
exports.localBanUser = function(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({name: username}).exec(function (err, user) {
      if (!user) {
        resolve('/u/' + username + ' was not locally banned because that user does not exist in the FlairHQ database.');
        console.log('/u/' + username + ' was not locally banned because that user does not exist in the FlairHQ database.');
      }
      else {
        user.banned = true;
        user.save(function (err) {
        if (err) {
          reject({error: 'Error banning user from local FlairHQ database'});
        }
        resolve('Banned /u/' + username + ' from local FlairHQ database');
        console.log('Banned /u/' + username + ' from local FlairHQ database');
      });
      }
    });
  });
};
exports.addUsernote = function(redToken, modname, subreddit, username, banNote) {
  return Usernotes.addUsernote(redToken, modname, subreddit, username, 'Banned - ' + banNote, 'ban', '');
}