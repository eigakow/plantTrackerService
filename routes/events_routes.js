// routes/events_routes.js
var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
  app.get('/events', (req, res) => {
    //console.log(req.query);
    const details = req.query;
    if (req.query._id) {
      req.query = { _id: ObjectID(req.query._id) };
    }
    db
      .collection('events')
      .find(req.query)
      .toArray((err, items) => {
        if (err) {
          res.status(500).send({ error: 'An error has occurred' });
        } else {
          console.log('Found items', items);
          res.send(items);
        }
      });
  });
  app.post('/events', (req, res) => {
    console.log(req.body.plantId, req.body.eventType, req.body.eventDate);
    if (
      req.body.eventDate &&
      req.body.plantId &&
      (req.body.eventType === 'watering' ||
        req.body.eventType === 'fertilizing' ||
        req.body.eventType === 'repotting' ||
        req.body.eventType === 'misting' ||
        req.body.eventType === 'cleaning')
    ) {
      //Checking plantid exists
      db
        .collection('myPlants')
        .findOne({ _id: ObjectID(req.body.plantId) }, (err, result) => {
          if (err) {
            res.status(400).send({
              error: 'An error has occurred',
              details: err
            });
          } else if (!result) {
            res.status(400).send({
              error: 'Wrong plantID provided'
            });
          } else {
            console.log('plantId existing, continue..', result);
            // creating event
            db.collection('events').insert(
              {
                plantId: req.body.plantId,
                eventType: req.body.eventType,
                eventDate: req.body.eventDate,
                other: req.body.other
              },
              (err, result) => {
                if (err) {
                  res.status(400).send({ error: 'An error has occurred' });
                } else {
                  console.log(result);
                  res.status(201).send(result.ops[0]);
                }
              }
            );
          }
        });
    } else {
      res
        .status(500)
        .send({ error: 'Not all mandatory fields (correctly) provided' });
    }
  });
  app.delete('/events', (req, res) => {
    //console.log(req.query);
    if (!req.query._id) {
      res.status(400).send({ error: 'No _id parameter provided' });
    } else {
      db
        .collection('events')
        .remove({ _id: ObjectID(req.query._id) }, (err, result) => {
          if (err) {
            res.status(500).send({ error: 'An error has occurred' });
          } else if (result.result.n === 1) {
            const text = 'Event ' + req.query._id + ' removed';
            res.send({ result: text });
          } else {
            res.status(404).send({
              error: 'Removal was unsuccessful, resource not found in db',
              details: result
            });
          }
        });
    }
  });
  app.put('/events', async (req, res) => {
    if (!req.query._id) {
      res.status(400).send({ error: 'No id parameter provided' });
    } else if (
      req.body.eventDate &&
      req.body.plantId &&
      (req.body.eventType === 'watering' ||
        req.body.eventType === 'fertilizing' ||
        req.body.eventType === 'repotting' ||
        req.body.eventType === 'misting' ||
        req.body.eventType === 'cleaning')
    ) {
      //Checking id exists
      db
        .collection('myPlants')
        .findOne({ _id: ObjectID(req.body.plantId) }, (err, result) => {
          if (err) {
            res
              .status(400)
              .send({ error: 'An error has occurred', details: err });
          } else if (!result) {
            res.status(400).send({
              error: 'Wrong plantID provided'
            });
          } else {
            //console.log('plantId existing, continue..');
            // updating event
            db.collection('events').updateOne(
              { _id: ObjectID(req.query._id) },
              {
                $set: {
                  plantId: req.body.plantId,
                  eventType: req.body.eventType,
                  eventDate: req.body.eventDate
                }
              },
              (err, result) => {
                if (err) {
                  res
                    .status(400)
                    .send({ error: 'An error has occurred', details: err });
                } else if (result.result.n === 1) {
                  const text = 'Event ' + req.query._id + ' was modified';
                  res.send({ result: text });
                } else {
                  res.status(404).send({
                    error: 'Update was unsuccessful, resource not found in db',
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
  });
};
