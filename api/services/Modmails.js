var relevantKeys = ['name', 'subject', 'body', 'author', 'subreddit', 'first_message_name', 'created_utc', 'parent_id', 'distinguished'];
var addModmailsToDatabase = async function (batch) {
  if (!batch) {
    return;
  }
  let modmails = batch.data.children;
  for (let i = 0; i < modmails.length; i++) {
    let compressed = {};
    for (let j = 0; j < relevantKeys.length; j++) {
      compressed[relevantKeys[j]] = modmails[i].data[relevantKeys[j]];
    }
    await Modmail.findOrCreate(compressed.name, compressed);
    //Recursively add the replies to the database
    await addModmailsToDatabase(modmails[i].data.replies);
  }
};
exports.updateArchive = async function (subreddit) {
  let most_recent = await Modmail.find({subreddit: subreddit, limit: 1, sort: 'created_utc DESC'});
  if (!most_recent.length) {
    console.log('Modmail archives for /r/' + subreddit + ' could not be found for some reason. Recreating from scratch...');
    await exports.createArchiveFromScratch(subreddit);
    return;
  }
  var before = most_recent[0].first_message_name || most_recent[0].name;
  while (before !== null) {
    let batch = await Reddit.getModmail(sails.config.reddit.adminRefreshToken, subreddit, undefined, before);
    before = batch.data.before;
    await addModmailsToDatabase(batch);
  }
};
exports.createArchiveFromScratch = async function (subreddit) {
  var after = '';
  while (after !== null) {
    let batch = await Reddit.getModmail(sails.config.reddit.adminRefreshToken, subreddit, after);
    after = batch.data.after;
    await addModmailsToDatabase(batch);
  }
};
