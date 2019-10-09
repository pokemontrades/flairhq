const updateModmail = function (sails) {
  sails.log.info('[Daily task]: Updating modmail archives...');
  Promise.all([Modmails.updateArchive('pokemontrades'), Modmails.updateArchive('SVExchange')]).then(function (results) {
    sails.log.info('[Daily task]: Finished updating modmail archives.');
  }, function (error) {
    sails.log.error('There was an issue updating the modmail archives.');
    sails.log.error(error);
  });
}

module.exports.schedule = {
  
  jobs: [
    {
      cron: "0 8 * * *", method: updateModmail
    }
  ]
  
};