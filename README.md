# Flair HQ

## How to setup your own dev environment

### 1. Create two subreddits for testing

You probably don't to do testing on production so the we suggest to create two subreddits for testing purposes. [Start here](https://www.reddit.com/subreddits/create). You can choose any names for it (such as yourUsername and yourUsername1). Once you have the subreddits created, create another reddit account.  
Your first account will automatically get mod permission on both subreddits and the other one you can use to testing from end user point of view.

### 2. Install prerequisites

   Make sure you have Node.js ([some helpful guides here](https://nodejs.org/en/download/package-manager/)) and MongoDB ([check it here](https://docs.mongodb.com/manual/installation/)) installed (you can install both of them using default settings). If possible install the newest stable release. For Node.js version 4.0.0 is minimal.
   
### 3. Prepare the application folder 

   Clone the repository using `git clone https://github.com/pokemontrades/flairhq.git` (you might have to install git first). Navigate into the directory `flairhq` and run `npm install` to install the dependencies. After all of them are installed you can start preparing your local configuration.  
   Copy `config/local.example.js` to `config/local.js`. You'll use it in next steps.
   
### 4. Create a reddit app

   Go to the site [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps). If this is your first reddit application, scroll down and click `Are you a developer? Create an app` button.  
   Choose 'web app' as a type of your application. Set redirect uri to https://not-an-aardvark.github.io/reddit-oauth-helper/ (this is temporary link which will be needed in next step). Fill in 'name'. Other fields are optional.  
   Copy the Client ID and Secret (as per screenshot below) to `config/local.js`. Do not close the tab.
   
   ![dev-setup-1](https://user-images.githubusercontent.com/15113729/31516749-e7a5bfc6-af99-11e7-92c4-1f3519aa0c41.png)


### 5. Generate refresh token for a moderator account

   **Make sure to use the account with mod permissions in this step**.  
   Go to [this repo](https://github.com/not-an-aardvark/reddit-oauth-helper) to get a refresh token for a moderator on the subs. Scope you'll have to use is `flair modcontributors modflair modposts privatemessages read wikiedit wikiread`. **Remember to choose permanent token**.  
   If you use web interface you should click `Allow` while redirected to reddit  
   After that the current tab will be closed and you'll see your tokens at the bottom of the tool as shown on the screenshot. Copy your **refresh token** to config/local.js.
   
  
   ![dev-setup-3-1](https://user-images.githubusercontent.com/15113729/31516886-528e0596-af9a-11e7-9dd8-509fa469d0b6.png)
	
### 6. Change subreddits names

   In your application folder change all occurences of `pokemontrades` and `SVExchange` to the names of your testing subreddits. On Linux you can use:
   
   ```
   find . -type f -exec sed -i 's/pokemontrades/mySubreddit/gI' {} \;
   find . -type f -exec sed -i 's/SVExchange/mySubreddit1/gI' {} \;
   ```

### 7. Start the application

   Before you can start you'll have to go to your reddit app settings and change redirect uri to http://localhost:1337/auth/reddit/callback. Then you can start MongoDB (check [here](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/)) and start sails with `npm start`.  
   Open http://localhost:1337 in your browser. You should see the starting page. Once you sign in as mod you can also add flair schema to both of your subreddits.
	
### Have fun with coding FlairHQ!

   If you're not sure where to start, check [current issues](https://github.com/pokemontrades/flairhq/issues). Choose one, write a fix and make a pull request. Feel free to ask if you're not sure about anything.

## Troubleshooting dev environment installation

### How I can check if MongoDB started correctly?
Check for 'waiting for connections' message as below:
![dev-setup-4](https://user-images.githubusercontent.com/15113729/31516787-08c06e72-af9a-11e7-8472-b5222c23dc02.png)

### How can I know that FlairHQ app started correctly?
Check for the message 'Waiting' after 'watch' task is started:
![dev-setup-5](https://user-images.githubusercontent.com/15113729/31516795-0d06f46a-af9a-11e7-9aca-efb808a9d2bf.png)
