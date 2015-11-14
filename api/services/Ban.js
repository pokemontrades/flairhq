exports.banFromSub = async function (redToken, username, banMessage, banNote, subreddit, duration) {
  try {
    await Reddit.banUser(redToken, username, banMessage, banNote, subreddit, duration);
    console.log('Banned ' + username + ' from /r/' + subreddit);
    return 'Banned ' + username + ' from /r/' + subreddit;
  } catch (err) {
    throw {error: 'Failed to ban user from /r/' + subreddit};
  }
};

//Give the 'BANNED USER' flair on a subreddit
exports.giveBannedUserFlair = async function (redToken, username, css_class, flair_text, subreddit) {
  try {
    await Reddit.setFlair(redToken, username, css_class, flair_text, subreddit);
    console.log('Changed ' + username + '\'s flair to ' + css_class + ' on /r/' + subreddit);
    return 'Changed ' + username + '\'s flair to ' + css_class + ' on /r/' + subreddit;
  } catch (err) {
    throw {error: 'Failed to give banned user flair'};
  }
};
//Update the AutoModerator config with the user's friend codes
exports.updateAutomod = async function (redToken, username, subreddit, friend_codes) {
  try {
    var current_config = await Reddit.getWikiPage(redToken, subreddit, 'config/automoderator');
  } catch (e) {
    throw {error: 'Error retrieving /r/' + subreddit + ' AutoModerator config'};
  }
  var lines = current_config.replace(/\r/g, '').split("\n");
  var fclist_indices = [lines.indexOf('#FCList1') + 1, lines.indexOf('#FCList2') + 1];
  if (fclist_indices.indexOf(0) != -1) {
    console.log(lines);
    console.log('Error: Could not find #FCList tags in /r/' + subreddit + ' AutoModerator config');
    throw {error: 'Error parsing /r/' + subreddit + ' AutoModerator config'};
  }
  try {
    for (var listno = 0; listno < fclist_indices.length; listno++) {
      var punctuation = listno ? [']', ', "', '-', '"'] : ['"', '|', ' ?-? ?', ''];
      var end_delimiter_index = lines[fclist_indices[listno]].lastIndexOf(punctuation[0]);
      var before_end = lines[fclist_indices[listno]].substring(0, end_delimiter_index);
      for (var i = 0; i < friend_codes.length; i++) {
        before_end += punctuation[1] + friend_codes[i].replace(/-/g, punctuation[2]) + punctuation[3];
      }
      lines[fclist_indices[listno]] = before_end + lines[fclist_indices[listno]].substring(end_delimiter_index);
    }
  }
  catch (automodparseerr) {
    console.log('Error parsing /r/' + subreddit + ' AutoModerator config');
    throw {error: 'Error parsing /r/' + subreddit + ' AutoModerator config'};
  }
  var content = lines.join("\n");
  await Reddit.editWikiPage(redToken, subreddit, 'config/automoderator', content, 'FlairHQ: Updated banned friend codes');
  var output = 'Added /u/' + username + '\'s friend codes to /r/' + subreddit + ' AutoModerator blacklist';
  console.log(output);
  return output;
};
//Remove the user's TSV threads on /r/SVExchange.
exports.removeTSVThreads = async function (redToken, username) {
  var response = await Reddit.searchTSVThreads(redToken, username);
  var removeTSVPromises = [];
  response.data.children.forEach(function (entry) {
    removeTSVPromises.push(Reddit.removePost(redToken, entry.data.id, 'false'));
  });
  await Promise.all(removeTSVPromises);
  var output = 'Removed /u/' + username + '\'s TSV threads (' + response.data.children.length.toString() + ' total)';
  console.log(output);
  return output;
};
//Update the public banlist with the user's information
exports.updateBanlist = async function (redToken, username, banlistEntry, friend_codes, igns) {
  var current_list = await Reddit.getWikiPage(redToken, 'pokemontrades', 'banlist');
  var lines = current_list.replace(/\r/g, '').split("\n");
  var start_index = lines.indexOf('[//]:# (BEGIN BANLIST)') + 3;
  if (start_index == 2) {
    console.log('Error: Could not find start marker in public banlist');
    throw {error: 'Error while parsing public banlist'};
  }
  var line_to_add = '/u/' + username + ' | ' + friend_codes.join(', ') + ' | ' + banlistEntry + ' | ' + igns;
  var content = lines.slice(0, start_index).join("\n") + "\n" + line_to_add + "\n" + lines.slice(start_index).join("\n");
  try {
    await Reddit.editWikiPage(redToken, 'pokemontrades', 'banlist', content, '');
  } catch (e) {
    console.log(e);
    throw {error: 'Failed to update public banlist'};
  }
  console.log('Added /u/' + username + ' to public banlist');
  return 'Added /u/' + username + ' to public banlist';
};
exports.localBanUser = async function (username) {
  User.findOne({name: username}).exec(function (err, user) {
    if (!user) {
      console.log('/u/' + username + ' was not locally banned because that user does not exist in the FlairHQ database.');
      return '/u/' + username + ' was not locally banned because that user does not exist in the FlairHQ database.';
    }
    else {
      user.banned = true;
      user.save(function (err) {
        if (err) {
          throw {error: 'Error banning user from local FlairHQ database'};
        }
        console.log('Banned /u/' + username + ' from local FlairHQ database');
        return 'Banned /u/' + username + ' from local FlairHQ database';
      });
    }
  });
};
exports.addUsernote = function (redToken, modname, subreddit, username, banNote) {
  return Usernotes.addUsernote(redToken, modname, subreddit, username, 'Banned - ' + banNote, 'ban', '').then(function (response) {
    console.log('Created a usernote on ' + username + ' in /r/' + subreddit);
    return response;
  }, function () {
    throw {error: 'Failed to update /u/' + subreddit + 'usernotes.'};
  });
};
