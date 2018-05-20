// routes/myPlants_routes.js
var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
  app.get('/myPlants', (req, res) => {
    //console.log(req.query);
    //console.log(`User authenticated? ${req.isAuthenticated()}`);
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (req.query._id) {
        req.query = { _id: ObjectID(req.query._id) };
      }
      //const details = req.query;
      db
        .collection('myPlants')
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
  app.post('/myPlants', (req, res) => {
    //console.log(req.body.name, req.body.plantTypeId);
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (req.body.name && req.body.plantTypeId) {
        //Checking plantid exists
        db
          .collection('plantTypes')
          .findOne({ _id: ObjectID(req.body.plantTypeId) }, (err, result) => {
            if (err) {
              res.status(400).send({
                error: 'An error has occurred',
                details: err
              });
            } else if (!result) {
              res.status(400).send({
                error: 'Wrong plantTypeID provided'
              });
            } else {
              //console.log('plantTypeId existing, continue..', result);
              db.collection('myPlants').insert(
                {
                  name: req.body.name,
                  plantTypeId: req.body.plantTypeId
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
            }
          });
      } else {
        res.status(400).send({ error: 'Not all mandatory fields provided' });
      }
    }
  });
  app.delete('/myPlants', (req, res) => {
    //console.log(req.query);
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (!req.query._id) {
        res.status(400).send({ error: 'No _id parameter provided' });
      } else {
        db
          .collection('myPlants')
          .remove({ _id: ObjectID(req.query._id) }, (err, result) => {
            if (err) {
              res.status(500).send({ error: 'An error has occurred' });
            } else if (result.result.n === 1) {
              const text = 'MyPlant ' + req.query._id + ' removed';
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
  });
  app.put('/myPlants', (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      if (!req.query._id) {
        res.status(400).send({ error: 'No id parameter provided' });
      } else if (req.body.name && req.body.plantTypeId) {
        //Checking planttypeid exists
        db
          .collection('plantTypes')
          .findOne({ _id: ObjectID(req.body.plantTypeId) }, (err, result) => {
            if (err) {
              res.status(400).send({
                error: 'An error has occurred',
                details: err
              });
            } else if (!result) {
              res.status(400).send({
                error: 'Wrong plantTypeId provided'
              });
            } else {
              //console.log('plantTypeId existing, continue..', result);
              db.collection('myPlants').updateOne(
                { _id: ObjectID(req.query._id) },
                {
                  $set: {
                    name: req.body.name,
                    plantTypeId: req.body.plantTypeId
                  }
                },
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res
                      .status(400)
                      .send({ error: 'An error has occurred', details: err });
                  } else if (result.result.n === 1) {
                    const text = 'MyPlant ' + req.query._id + ' was modified';
                    res.send({ result: text });
                  } else {
                    res.status(404).send({
                      error:
                        'Update was unsuccessful, resource not found in db',
                      details: result
                    });
                  }
                }
              );
            }
          });
      } else {
        res.status(400).send({ error: 'Not all mandatory fields provided' });
      }
    }
  });
};
