'use strict';

const expect = require('chai').expect;
var request = require('supertest');
const host = 'http://localhost:60701';
const dbconnect = require('../server');

let plantId,
  planttypeid,
  body,
  eventid,
  newdate,
  eventType = 'watering',
  fakeplantId = '1119742c058b692566932709';

describe('loading Express', () => {
  before(done => {
    //Creating a plant type
    body = {
      name: 'mocha_planttypeforplanttest',
      watering: 'Likes water',
      fertilizing: 'Once a month'
    };
    request(host)
      .post('/plantTypes')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        planttypeid = res.body._id;
        //console.log('Using plant: ' + plantId);
        body = { name: 'mocha_plantforeventtest', plantTypeId: planttypeid };
        request(host)
          .post('/myPlants')
          .set('Content-Type', 'application/json')
          .send(body)
          .expect(201)
          .end(function(err, res) {
            if (err) return done(err);
            plantId = res.body._id;
            //console.log('Using plant: ' + plantId);
            return done();
          });
      });
  });
  it('responds to /events', done => {
    request(host)
      .get('/events')
      .expect(200, done);
  });
  it('404 everything else', done => {
    request(host)
      .get('/foo/bar')
      .expect(404, done);
  });
});
describe('adding new events', () => {
  it('creates a new event', done => {
    body = { eventType: 'watering', eventDate: Date.now(), plantId: plantId };
    request(host)
      .post('/events')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        eventid = res.body._id;
        return done();
      });
  }).timeout(1000);
  it('responds 500 if not all parameters were provided', done => {
    body = { eventType: 'watering', plantId: plantId };
    request(host)
      .post('/events')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  }).timeout(500);
  it("responds 400 if plantId doesn't exist", done => {
    body = {
      eventType: 'watering',
      eventDate: Date.now(),
      plantId: fakeplantId
    };
    request(host)
      .post('/events')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  }).timeout(500);
});
describe('getting events', () => {
  it('returns the event specified with _id', done => {
    request(host)
      .get('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(1);
        //console.log('    Response body: ', res.body[0]._id);
        return done();
      });
  });
  it('returns the plant specified with eventType', done => {
    request(host)
      .get('/events?eventType=' + eventType)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.above(0);
        return done();
      });
  });
  it('returns 200 if none found', done => {
    request(host)
      .get('/events?_id=' + fakeplantId)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(0);
        return done();
      });
  });
  it('returns 200 with no query parameter', done => {
    request(host)
      .get('/events')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
describe('updating events', () => {
  it('returns 400 if no _id provided', done => {
    request(host)
      .put('/events')
      .set('Content-Type', 'application/json')
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('returns 404 when event not found', done => {
    request(host)
      .put('/events?_id=' + fakeplantId)
      .set('Content-Type', 'application/json')
      .send({ eventType: eventType, eventDate: Date.now(), plantId: plantId })
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('returns 400 when not all fields provided in the body', done => {
    request(host)
      .put('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .send({ eventDate: Date.now(), plantId: plantId })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('returns 400 when wrong eventType given', done => {
    request(host)
      .put('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .send({ eventType: 'eating', eventDate: Date.now(), plantId: plantId })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('returns 400 when wrong plantId given', done => {
    request(host)
      .put('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .send({
        eventType: eventType,
        eventDate: Date.now(),
        plantId: fakeplantId
      })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('changes the event date', done => {
    newdate = Date.now();
    request(host)
      .put('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .send({ eventType: eventType, eventDate: newdate, plantId: plantId })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('changes were permanent', done => {
    request(host)
      .get('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body[0].eventDate).to.equal(newdate);
        //console.log(res.body);
        return done();
      });
  });
});
describe('removing events', () => {
  it('returns 400 if no _id provided', done => {
    request(host)
      .delete('/events')
      .set('Content-Type', 'application/json')
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('returns 404 if not existing _id provided', done => {
    request(host)
      .delete('/events?_id=' + fakeplantId)
      .set('Content-Type', 'application/json')
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('removes the event by _id', done => {
    request(host)
      .delete('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('changes were permanent', done => {
    request(host)
      .get('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(0);
        //console.log(res.body);
        return done();
      });
  });

  after(() => {
    request(host)
      .delete('/myPlants?_id=' + plantId)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
});
