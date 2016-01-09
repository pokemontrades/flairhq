var pako = require('pako'),
  sha256 = require('sha256'),
  moment = require('moment');
var decompress = function(blob) {
  var inflate = new pako.Inflate({to: 'string'});
  inflate.push(new Buffer(blob, 'base64').toString('binary'));
  return JSON.parse(inflate.result);
};
var compress = function(notesObject) {
  var deflate = new pako.Deflate({to: 'string'});
  deflate.push(JSON.stringify(notesObject), true);
  return (new Buffer(deflate.result.toString(), 'binary')).toString('base64');
};
exports.addUsernote = async function (redToken, modname, subreddit, user, noteText, type, link_index) {
  let compressed_notes = await Reddit.getWikiPage(redToken, subreddit, 'usernotes');
  var parsed = JSON.parse(compressed_notes);
  var mods = parsed.constants.users;
  var warnings = parsed.constants.warnings;
  var notes = decompress(parsed.blob);
  if (!notes[user]) {
    notes[user] = {ns: []};
  }
  if (mods.indexOf(modname) == -1) {
    mods.push(modname);
  }
  if (warnings.indexOf(type) == -1) {
    warnings.push(type);
  }
  var newNote = {
    n: noteText,
    t: moment().unix(),
    m: mods.indexOf(modname),
    l: link_index,
    w: warnings.indexOf(type)
  };
  notes[user].ns.unshift(newNote);
  parsed.blob = compress(notes);
  await Reddit.editWikiPage(redToken, subreddit, 'usernotes', JSON.stringify(parsed), 'FlairHQ: Created note on /u/' + user);
  var hash = sha256(user + newNote.n + newNote.t + newNote.m + newNote.l + newNote.w);
  /* By default, notes on a particular user are not indexed. This makes it difficult if one wants to delete a specific note that it created,
  * because new notes might have been added or removed since the note in question was created.
  * To resolve this issue, the addUsernote function returns a hash of the note when it's added. Then a specific note can be deleted by
  * searching for a note that matches a particular hash. */
  return hash;
};
exports.removeUsernote = async function (redToken, username, subreddit, note_hash) {
  let compressed_notes = await Reddit.getWikiPage(redToken, subreddit, 'usernotes');
  var pageObject = JSON.parse(compressed_notes);
  var notes = decompress(pageObject.blob);
  for (var i = 0; i < notes[username].ns.length; i++) {
    var note = notes[username].ns[i];
    if (note_hash === sha256(username + note.n + note.t + note.m + note.l + note.w)) {
      notes[username].ns.splice(i,1);
      i--;
    }
  }
  pageObject.blob = compress(notes);
  var reason = 'FlairHQ: Deleted note ' + note_hash.substring(0,7) + ' on ' + username;
  await Reddit.editWikiPage(redToken, subreddit, 'usernotes', JSON.stringify(pageObject), reason);
  return;
};
