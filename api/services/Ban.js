var _ = require('lodash');
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
exports.giveBannedUserFlair = async function (redToken, username, current_css_class, current_flair_text, subreddit) {
  try {
    var flair_text = current_flair_text || '';
    var css_class;
    if (subreddit === 'pokemontrades') {
      css_class = current_css_class ? current_css_class.replace(/ [^ ]*/, '') + ' banned' : 'default banned';
    } else {
      css_class = current_css_class ? current_css_class + ' banned' : 'banned';
    }
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
        let formatted = friend_codes[i].replace(/-/g, punctuation[2]);
        if (lines[fclist_indices[listno]].indexOf(formatted) === -1) {
          before_end += punctuation[1] + formatted + punctuation[3];
        }
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
exports.updateBanlist = async function (redToken, username, banlistEntry, friend_codes, igns, knownAlt) {
  var valid_FCs = friend_codes.filter(Flairs.validFC);
  if (valid_FCs.length) {
    friend_codes = valid_FCs;
  }
  var current_list = await Reddit.getWikiPage(redToken, 'pokemontrades', 'banlist');
  var lines = current_list.replace(/\r/g, '').split("\n");
  var start_index = lines.indexOf('[//]:# (BEGIN BANLIST)') + 3;
  var end_index = lines.indexOf('[//]:# (END BANLIST)');
  if (start_index === 2 || end_index === -1) {
    console.log('Error: Could not find parsing marker in public banlist');
    throw {error: 'Error: Could not find parsing marker in public banlist'};
  }
  var updated_content = '';
  for (let i = start_index; i < end_index; i++) {
    if (knownAlt && lines[i].match(new RegExp('/u/' + knownAlt)) || _.intersection(lines[i].match(/(\d{4}-){2}\d{4}/g), friend_codes).length) {
      // User was an alt account, modify the existing line instead of creating a new one
      let blocks = lines[i].split(' | ');
      if (blocks.length !== 4) {
        break;
      }
      blocks[0] += ', /u/' + username;
      blocks[1] = _.union(blocks[1].match(/(\d{4}-){2}\d{4}/g), friend_codes).join(', ');
      blocks[3] = _.union(blocks[3].split(', '), [igns]).join(', ');
      let new_line = blocks.join(' | ');
      updated_content = lines.slice(0, start_index).concat(new_line).concat(lines.slice(start_index, i)).concat(lines.slice(i + 1)).join('\n');
    }
  }
  if (!updated_content) {
    // User was probably not an alt, create a new line
    let new_line = ['/u/' + username, friend_codes.join(', '), banlistEntry, igns].join(' | ');
    updated_content = lines.slice(0, start_index).concat(new_line).concat(lines.slice(start_index)).join('\n');
  }
  try {
    await Reddit.editWikiPage(redToken, 'pokemontrades', 'banlist', updated_content, '');
  } catch (e) {
    console.log(e);
    throw {error: 'Failed to update public banlist'};
  }
  console.log('Added /u/' + username + ' to public banlist');
  return 'Added /u/' + username + ' to public banlist';
};
exports.localBanUser = async function(username) {
  try {
    let update = await User.update(username, {banned: true});
    console.log('Updated local banlist');
    return update;
  } catch (err) {
    console.log(err);
    throw {error: 'Failed to locally ban /u/' + username};
  }
};
exports.addUsernote = function (redToken, modname, subreddit, username, banNote, duration) {
  var type = duration ? 'ban' : 'permban';
  var note = duration ? 'Tempbanned for ' + duration + ' days - ' + banNote : 'Banned - ' + banNote;
  return Usernotes.addUsernote(redToken, modname, subreddit, username, note, type, '').then(function (response) {
    console.log('Created a usernote on ' + username + ' in /r/' + subreddit);
    return response;
  }, function () {
    throw {error: 'Failed to update /u/' + subreddit + 'usernotes.'};
  });
};
