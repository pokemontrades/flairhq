var relevantKeys = ['name', 'subject', 'body', 'author', 'subreddit', 'first_message_name', 'created_utc', 'parent_id', 'distinguished'];
var addModmailsToDatabase = async function (modmails) {
  var promises = [];
  for (let i = 0; i < modmails.length; i++) {
    let compressed = {};
    for (let j = 0; j < relevantKeys.length; j++) {
      compressed[relevantKeys[j]] = modmails[i].data[relevantKeys[j]];
    }
    promises.push(Modmail.findOrCreate(compressed.name, compressed));
    if (modmails[i].data.replies) {
      promises.push(addModmailsToDatabase(modmails[i].data.replies.data.children));
    }
  }
  return Promise.all(promises);
};
exports.updateArchive = async function (subreddit) {
  let most_recent = await Modmail.find({subreddit: subreddit, limit: 1, sort: 'created_utc DESC'});
  if (!most_recent.length) {
    console.log('Modmail archives for /r/' + subreddit + ' could not be found for some reason. Recreating from scratch...');
    return addModmailsToDatabase(await Reddit.getModmail(sails.config.reddit.adminRefreshToken, subreddit));
  }
  let before = most_recent[0].first_message_name || most_recent[0].name;
  return addModmailsToDatabase(await Reddit.getModmail(sails.config.reddit.adminRefreshToken, subreddit, undefined, before));
};
