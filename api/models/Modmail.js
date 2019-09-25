module.exports = {
  attributes: {
    id: { //The fullname ('t4_' + base36id) of the message
      type: 'string',
      unique: true
    },
    subject: 'string', //Subject of the message
    body: 'string', //Body of the message
    author: 'string', //Username of the message author
    subreddit: { //The subreddit that the modmail was sent to
      type: 'string',
      isIn: ['pokemontrades', 'SVExchange']
    },
    first_message_name: { //The fullname of the first message in this chain, or null if this is the first message
      type: 'string',
      allowNull: true
    },
    created_utc: { //The UTC timestamp of when the message was created
      type: 'number'
    },
    parent_id: { //The fullname of the parent message, or null if this is the first message
      type: 'string',
      allowNull: true
    },
    distinguished: { //This will be 'moderator' if the author was a mod, 'admin' if the author was a reddit admin, or null otherwise
      type: 'string',
      allowNull: true,
      isIn: ['moderator', 'admin']
    }
  }
};
