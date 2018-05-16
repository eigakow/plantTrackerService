'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const db = require('./config/db');
const app = express();

app.use(bodyParser.json({ extended: true }));

MongoClient.connect(db.prod.url, (err, client) => {
  if (err) return console.log(err);
  // Make sure you add the database name and not the collection name
  let database = client.db(db.prod.database_name);
  require('./routes')(app, database);
  if (!module.parent) {
    app.listen(60701, () => {
      console.log('We are live on ' + 60701);
    });
  }
});
