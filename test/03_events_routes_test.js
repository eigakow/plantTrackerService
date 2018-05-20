'use strict';

const expect = require('chai').expect;
const dbconnect = require('../server');
//const host = 'http://localhost:' + process.env.PORT;
const host =
  'http://planttrackerservice-planttrackerservice.a3c1.starter-us-west-1.openshiftapps.com';

var request = require('supertest');
var agent = request.agent(host);
var agentNotOk = request.agent(host);

let plantId,
  planttypeid,
  body,
  eventid,
  newdate,
  eventType = 'watering',
  fakeplantId = '1119742c058b692566932709';

describe('loading Express', () => {
  it('logs in successfully', done => {
    body = {
      email: process.env.USER_EMAIL,
      password: process.env.USER_TEST_PASSWORD
    };
    agent
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('creates a plant type', done => {
    //Creating a plant type
    body = {
      name: 'mocha_planttypeforplanttest',
      watering: 'Likes water',
      fertilizing: 'Once a month'
    };
    agent
      .post('/plantTypes')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        planttypeid = res.body._id;
        //console.log('Using plant: ' + plantId);
        body = { name: 'mocha_plantforeventtest', plantTypeId: planttypeid };
        agent
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
    agent.get('/events').expect(200, done);
  });
  it('404 everything else', done => {
    agent.get('/foo/bar').expect(404, done);
  });
});
describe('adding new events', () => {
  it('creates a new event', done => {
    body = { eventType: 'watering', eventDate: Date.now(), plantId: plantId };
    agent
      .post('/events')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        eventid = res.body._id;
        return done();
      });
  });
  it('responds 500 if not all parameters were provided', done => {
    body = { eventType: 'watering', plantId: plantId };
    agent
      .post('/events')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it("responds 400 if plantId doesn't exist", done => {
    body = {
      eventType: 'watering',
      eventDate: Date.now(),
      plantId: fakeplantId
    };
    agent
      .post('/events')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
describe('getting events', () => {
  it('returns the event specified with _id', done => {
    agent
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
    agent
      .get('/events?eventType=' + eventType)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.above(0);
        return done();
      });
  });
  it('returns 200 if none found', done => {
    agent
      .get('/events?_id=' + fakeplantId)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(0);
        return done();
      });
  });
  it('returns 200 with no query parameter', done => {
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
});
describe('checking authorization', () => {
  it('creating a new event requires authorization', done => {
    body = { eventType: 'watering', eventDate: Date.now(), plantId: plantId };
    agentNotOk
      .post('/events')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('quering events requires authorization', done => {
    agentNotOk
      .get('/events?eventType=' + eventType)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('changing the event requires authorization', done => {
    newdate = Date.now();
    agentNotOk
      .put('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .send({ eventType: eventType, eventDate: newdate, plantId: plantId })
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('removing the event requires authorization', done => {
    agentNotOk
      .delete('/events?_id=' + eventid)
      .set('Content-Type', 'application/json')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
});

describe('cleanup', () => {
  it('logs in agentNotOk', done => {
    body = {
      email: process.env.USER_EMAIL,
      password: process.env.USER_TEST_PASSWORD
    };
    agentNotOk
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('logs out agentNotOk', done => {
    agentNotOk
      .post('/logout')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('removes the test plant', done => {
    agent
      .delete('/myPlants?_id=' + plantId)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('logs out agent', done => {
    agent
      .post('/logout')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
