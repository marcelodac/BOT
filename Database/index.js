const {
    JsonDatabase,
  } = require("wio.db");


  const General = new JsonDatabase({
    databasePath: "./Database/settings.json"
  });

  module.exports = {
    General
  }