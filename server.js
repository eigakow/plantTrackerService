'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt-nodejs');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const session = require('express-session');
const uuid = require('uuid');
const FileStore = require('session-file-store')(session);

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
  //  console.log('Loading env values: ', process.env);
}

app.use(helmet());
app.use(morgan('common'));
app.use(bodyParser.json({ extended: true }));

const user = {
  id: 1,
  email: process.env.USER_EMAIL,
  password: process.env.USER_PASSWORD
};
const users = [user];
// configure passport.js to use the local strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    if (email === user.email && bcrypt.compareSync(password, user.password)) {
      //console.log('Local strategy returned true');
      return done(null, user);
    } else {
      //console.log('Local strategy returned false');
      return done(true, false, { message: 'bad password' });
    }
  })
);
// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  //console.log('Inside serializeUser callback. User id is saved to the session file store here');
  //console.log('User id: ', user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  //console.log('Inside deserializeUser callback');
  //console.log(`The user id passport saved in the session file store is: ${id}`);
  const user = users[0].id === id ? users[0] : false;
  done(null, user);
});

app.use(
  session({
    genid: req => {
      //console.log('Inside the session middleware');
      //console.log(req.sessionID);
      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
      //console.log('URL: ', db_url);
      console.log('We are live on ' + port);
    });
  }
});
