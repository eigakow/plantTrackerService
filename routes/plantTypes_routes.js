// routes/plantTypes_routes.js
var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
  app.get('/plantTypes', (req, res) => {
    //console.log(req.query);
    //console.log(`User authenticated? ${req.isAuthenticated()}`);
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (req.query._id) {
        req.query = { _id: ObjectID(req.query._id) };
      }
      db
        .collection('plantTypes')
        .find(req.query)
        .toArray((err, items) => {
          if (err) {
            res.status(500).send({ error: 'An error has occurred' });
          } else {
            //console.log('Found items', items);
            res.send(items);
          }
        });
    }
  });
  // Possible characteristics: watering, fertilizing, repotting, misting, cleaning
  app.post('/plantTypes', (req, res) => {
    //console.log(req.body.name, req.body.plantType);
    //console.log(`User authenticated? ${req.isAuthenticated()}`);
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (req.body.name) {
        db.collection('plantTypes').insert(
          {
            name: req.body.name,
            watering: req.body.watering,
            fertilizing: req.body.fertilizing,
            repotting: req.body.repotting,
            misting: req.body.misting,
            cleaning: req.body.cleaning
          },
          (err, result) => {
            if (err) {
              res.status(500).send({ error: 'An error has occurred' });
            } else {
              //console.log(result);
              res.status(201).send(result.ops[0]);
            }
          }
        );
      } else {
        res.status(400).send({ error: 'Not all mandatory fields provided' });
      }
    }
  });
  app.delete('/plantTypes', (req, res) => {
    //console.log(req.query);
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (!req.query._id) {
        res.status(400).send({ error: 'No _id parameter provided' });
      } else {
        db
          .collection('plantTypes')
          .remove({ _id: ObjectID(req.query._id) }, (err, result) => {
            if (err) {
              res.status(500).send({ error: 'An error has occurred' });
            } else if (result.result.n === 1) {
              const text = 'PlantType ' + req.query._id + ' removed';
              res.send({ result: text });
            } else {
              res.status(404).send({
                error: 'Removal was unsuccessful, resource not found in db',
                details: result
              });
            }
          });
      }
    }
  }); // Possible characteristics: watering, fertilizing, repotting, misting, cleaning

  app.put('/plantTypes', (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (!req.query._id) {
        res.status(400).send({ error: 'No id parameter provided' });
      } else if (req.body.name) {
        const body = { name: req.body.name };
        if (req.body.watering) {
          body.watering = req.body.watering;
        }
        if (req.body.fertilizing) {
          body.fertilizing = req.body.fertilizing;
        }
        if (req.body.repotting) {
          body.repotting = req.body.repotting;
        }
        if (req.body.misting) {
          body.misting = req.body.misting;
        }
        if (req.body.cleaning) {
          body.cleaning = req.body.cleaning;
        }
        db
          .collection('plantTypes')
          .updateOne(
            { _id: ObjectID(req.query._id) },
            { $set: body },
            (err, result) => {
              if (err) {
                console.log(err);
                res
                  .status(400)
                  .send({ error: 'An error has occurred', details: err });
              } else if (result.result.n === 1) {
                const text = 'PlantType ' + req.query._id + ' was modified';
                res.send({ result: text });
              } else {
                res.status(404).send({
                  error: 'Update was unsuccessful, resource not found in db',
                  details: result
                });
              }
            }
          );
      } else {
        res.status(400).send({ error: 'Not all mandatory fields provided' });
      }
    }
  });
};
