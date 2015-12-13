# Flair HQ

## Setup

1. Make sure you have Node (>=4.0.0), and MongoDB installed
1. Clone the repository `git clone https://github.com/YaManicKill/flairhq.git`
1. Navigate into the directory `flairhq`
1. Run `npm install`  to install the dependencies
1. Copy config/local.example.js to config/local.js
1. Create a reddit app on [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
1. Copy the id and secret to config/local.js
1. Use something like https://github.com/xoru/easy-oauth to get a refresh token for a moderator on the subs
1. Start your MongoDB
1. Start sails with `npm start`
1. Open `http://localhost:1337` in your browser
