var relevantKeys = ['name', 'subject', 'body', 'author', 'subreddit', 'first_message_name', 'created_utc', 'parent_id', 'distinguished'];
var makeModmailObjects = function (modmails) {
  var all_modmails = [];
  for (let i = 0; i < modmails.length; i++) {
    let compressed = {};
    for (let j = 0; j < relevantKeys.length; j++) {
      compressed[relevantKeys[j]] = modmails[i].data[relevantKeys[j]];
    }
    all_modmails.push(compressed);
    if (modmails[i].data.replies) {
      all_modmails = all_modmails.concat(makeModmailObjects(modmails[i].data.replies.data.children));
    }
  }
  return all_modmails;
};
exports.updateArchive = async function (subreddit) {
  let most_recent = await Modmail.find({subreddit: subreddit, limit: 1, sort: 'created_utc DESC'});
  if (!most_recent.length) {
    sails.log.warn('Modmail archives for /r/' + subreddit + ' could not be found for some reason. Recreating from scratch...');
    return Modmail.findOrCreate(makeModmailObjects(await Reddit.getModmail(sails.config.reddit.adminRefreshToken, subreddit)));
  }
  return Modmail.findOrCreate(makeModmailObjects(await Reddit.getModmail(sails.config.reddit.adminRefreshToken, subreddit, undefined, most_recent[0].name)));
};
