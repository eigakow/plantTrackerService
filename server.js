'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
  //  console.log('Loading env values: ', process.env);
}

app.use(bodyParser.json({ extended: true }));

const port = process.env.PORT;
const db_name = process.env.DATABASE_NAME;
const db_url = process.env.DATABASE_URL;

MongoClient.connect(db_url, (err, client) => {
  if (err) return console.log(err);
  // Make sure you add the database name and not the collection name
  let database = client.db(db_name);
  require('./routes')(app, database);
  if (!module.parent) {
    app.listen(port, () => {
      console.log('URL: ', db_url);
      console.log('We are live on ' + port);
    });
  }
});
