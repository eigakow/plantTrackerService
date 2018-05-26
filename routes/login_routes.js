// routes/myPlants_routes.js
const ObjectID = require('mongodb').ObjectID;
const uuid = require('uuid');
const passport = require('passport');

module.exports = function(app, db) {
  app.post('/login', (req, res, next) => {
    //console.log('Inside POST /login callback');
    if (!req.body.email || !req.body.password) {
      res.status(400).send({ error: 'full credentials not provided' });
    } else {
      passport.authenticate('local', (err, user, info) => {
        //console.log('Inside passport.authenticate() callback');
        if (err) {
          return res.status(401).send({ error: 'unauthorized to access' });
        } else {
          //console.log(`req: ${JSON.stringify(req)}`);
          //console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
          //console.log(`req.user: ${JSON.stringify(req.user)}`);
          //console.log('Calling login with user ', user);
          req.login(user, err => {
            //console.log('Inside req.login() callback');
            //console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
            //console.log(`req.user: ${JSON.stringify(req.user)}`);
            return res.send({ message: 'You were authenticated & logged in!' });
          });
        }
      })(req, res, next);
    }
  });
  app.post('/logout', function(req, res) {
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      req.session.destroy(function(err) {
        res.send({ status: 'user logged out' });
      });
    }
  });
};
