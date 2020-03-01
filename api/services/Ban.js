var _ = require('lodash');
exports.banFromSub = async function (redToken, username, banMessage, banNote, subreddit, duration) {
  try {
    await Reddit.banUser(redToken, username, banMessage, banNote, subreddit, duration);
    sails.log('Banned ' + username + ' from /r/' + subreddit);
    return 'Banned ' + username + ' from /r/' + subreddit;
  } catch (err) {
    throw {error: 'Failed to ban user from /r/' + subreddit};
  }
};

//Give the 'BANNED USER' flair on a subreddit
exports.giveBannedUserFlair = async function (redToken, username, current_css_class, current_flair_text, subreddit) {
  try {
    var flair_text = current_flair_text || '';
    
    // Remove emoji if it exists
    var flair_arr = flair_text.split(' ');
    if (flair_arr[0] !== null) {
      if (flair_arr[0].indexOf(':') !== -1) {
        flair_arr.shift();
      }
    }
    
    // Add BANNED USER to flair text
    flair_text = 'BANNED USER ' + flair_arr.join(' ');
    if (flair_text.length >= 64) {
      flair_text = flair_text.slice(0, 64);
    }
      
    await Reddit.setUserFlair(redToken, username, 'banned', flair_text, subreddit);
    sails.log('Changed ' + username + '\'s flair to banned on /r/' + subreddit);
    return 'Changed ' + username + '\'s flair to banned on /r/' + subreddit;
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
    sails.log.error('Error: Could not find #FCList tags in /r/' + subreddit + ' AutoModerator config');
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
    sails.log.error('Error parsing /r/' + subreddit + ' AutoModerator config');
    throw {error: 'Error parsing /r/' + subreddit + ' AutoModerator config'};
  }
  var content = lines.join("\n");
  if (content !== current_config) {
    await Reddit.editWikiPage(redToken, subreddit, 'config/automoderator', content, 'FlairHQ: Updated banned friend codes');
  }
  var output = 'Added /u/' + username + '\'s friend codes to /r/' + subreddit + ' AutoModerator blacklist';
  sails.log(output);
  return output;
};
//Lock and give flair to the user's TSV threads.
exports.markTSVThreads = async function (redToken, username) {
  var threads = await Reddit.searchTSVThreads(redToken, username);
  var tsv_promises = [];
  threads.forEach(function (entry) {
    tsv_promises.push(Reddit.lockPost(redToken, entry.data.id));
    tsv_promises.push(Reddit.markNsfw(redToken, entry.data.id));
    tsv_promises.push(Reddit.setLinkFlair(redToken, entry.data.subreddit, entry.data.id, 'banned', 'TSV (Banned)'));
  });
  await Promise.all(tsv_promises);
  var output = 'Marked and locked /u/' + username + '\'s TSV threads (' + threads.length.toString() + ' total)';
  sails.log(output);
  return output;
};
//Update the public banlist with the user's information
exports.updateBanlist = async function (redToken, username, banlistEntry, friend_codes, igns, knownAlt, tradeNote) {
  var valid_FCs = friend_codes.filter(Flairs.validFC);
  if (valid_FCs.length) {
    friend_codes = valid_FCs;
  }
  var current_list = await Reddit.getWikiPage(redToken, 'pokemontrades', 'banlist');
  var lines = current_list.replace(/\r/g, '').split("\n");
  var start_index = lines.indexOf('[//]:# (BEGIN BANLIST)') + 3;
  var end_index = lines.indexOf('[//]:# (END BANLIST)');
  if (start_index === 2 || end_index === -1) {
    sails.log.error('Error: Could not find parsing marker in public banlist');
    throw {error: 'Error: Could not find parsing marker in public banlist'};
  }
  let updated_content;
  for (let i = start_index; i < end_index; i++) {
    lines[i] = lines[i].replace(RegExp('\\\\_','g'),'_');
    if (knownAlt && lines[i].includes(knownAlt) || lines[i].includes(username)
        ||_.intersection(lines[i].match(/(\d{4}-){2}\d{4}/g), friend_codes).length) {
      // User was an alt account, modify the existing line instead of creating a new one
      let blocks = lines[i].split(/\s*\|\s*/);
      if (blocks.length === 6 && !(blocks[5])) { // to handle banlist entries with | at the end
        blocks.pop();
      }
      let user_regex = '(?:^|\\s)('+username+(knownAlt ? '|'+knownAlt : '')+')(?:,|$)';
      let fc_match = _.intersection(blocks[1].match(/(\d{4}-){2}\d{4}/g), friend_codes).length;
      if (blocks.length !== 5 || !(fc_match || blocks[0].match(new RegExp(user_regex)))) {
        continue;
      }
      blocks[0] = _.union(blocks[0].match(/[\w-]{1,20}/g), [username]).join(', ').replace(RegExp('_','g'),'\\_');
      blocks[1] = _.union(blocks[1].match(/(\d{4}-){2}\d{4}/g), friend_codes).join(', ');
      try {
        blocks[3] = Flairs.formatGames(Flairs.combineGames(Flairs.parseGames(blocks[3]), Flairs.parseGames(igns)));
      } catch (err) {
        blocks[3] += igns;
      }
      blocks[4] = tradeNote || blocks[4] || '';
      let new_line = blocks.join(' | ');
      updated_content = lines.slice(0, start_index).concat(new_line).concat(lines.slice(start_index, i)).concat(lines.slice(i + 1)).join('\n');
      break;
    }
  }
  if (!updated_content) {
    // User was probably not an alt, create a new line
    let formatted_igns;
    try {
      formatted_igns = Flairs.formatGames(Flairs.parseGames(igns));
    } catch (err) {
      formatted_igns = igns;
    }
    let new_line = [username, friend_codes.join(', '), banlistEntry, formatted_igns, tradeNote].join(' | ');
    updated_content = lines.slice(0, start_index).concat(new_line).concat(lines.slice(start_index)).join('\n');
  }
  try {
    await Reddit.editWikiPage(redToken, 'pokemontrades', 'banlist', updated_content, '');
  } catch (e) {
    sails.log.error(e);
    throw {error: 'Failed to update public banlist'};
  }
  sails.log('Added /u/' + username + ' to public banlist');
  return 'Added /u/' + username + ' to public banlist';
};
exports.localBanUser = async function(username) {
  try {
    let update = await User.update(username, {banned: true});
    sails.log('Updated local banlist');
    return update;
  } catch (err) {
    sails.log.error(err);
    throw {error: 'Failed to locally ban /u/' + username};
  }
};
exports.addUsernote = function (redToken, modname, subreddit, username, banNote, duration) {
  var type = duration ? 'ban' : 'permban';
  var note = duration ? 'Tempbanned for ' + duration + ' days - ' + banNote : 'Banned' + (banNote ? ' - ' + banNote : '');
  return Usernotes.addUsernote(redToken, modname, subreddit, username, note, type, '').then(function (response) {
    sails.log('Created a usernote on ' + username + ' in /r/' + subreddit);
    return response;
  }, function () {
    throw {error: 'Failed to update /u/' + subreddit + 'usernotes.'};
  });
};
