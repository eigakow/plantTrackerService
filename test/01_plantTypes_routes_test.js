'use strict';

const expect = require('chai').expect;
const dbconnect = require('../server');
//const host = 'http://localhost:' + process.env.PORT;
const host =
  'http://planttrackerservice-planttrackerservice.a3c1.starter-us-west-1.openshiftapps.com';

var request = require('supertest');
var agent = request.agent(host);
var agentNotOk = request.agent(host);

let planttypename,
  body,
  newplanttypename,
  planttypeid,
  fakeplanttypeId = '1119742c058b692566932709',
  wateringpref = '',
  fertilizingpref = '',
  repottingpref = '',
  mistingpref = '',
  cleaningpref = '';

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
  it('responds to /plantTypes', done => {
    agent.get('/plantTypes').expect(200, done);
  });
  it('404 everything else', done => {
    agent.get('/foo/bar').expect(404, done);
  });
});
describe('adding new plant type', () => {
  it('creates a new plant type', done => {
    planttypename =
      'mochaplanttype' +
      Math.random()
        .toString(36)
        .substring(7);
    body = {
      name: planttypename,
      watering: wateringpref,
      fertilizing: fertilizingpref
    };
    agent
      .post('/plantTypes')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        planttypeid = res.body._id;
        //  console.log(res.body);
        return done();
      });
  });

  it('responds 400 if not all required parameters were provided', done => {
    body = {
      watering: wateringpref,
      fertilizing: fertilizingpref
    };
    agent
      .post('/plantTypes')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
});

describe('getting plantTypes', () => {
  it('returns the plant specified with _id', done => {
    agent
      .get('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(1);
        return done();
      });
  });
  it('returns the plant specified with name', done => {
    agent
      .get('/plantTypes?name=' + planttypename)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.above(0);
        return done();
      });
  });
  it('returns 200 if none found', done => {
    agent
      .get('/plantTypes?_id=' + fakeplanttypeId)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        expect(res.body.length).to.equal(0);
        return done();
      });
  });
  it('returns 200 with no query parameter', done => {
    agent
      .get('/plantTypes')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
});

describe('updating plantTypes', () => {
  it('responds 404 when planttypeId not found', done => {
    agent
      .put('/plantTypes?_id=' + fakeplanttypeId)
      .set('Content-Type', 'application/json')
      .send({ name: planttypename, watering: wateringpref })
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('responds 400 when no_id provided', done => {
    agent
      .put('/plantTypes')
      .set('Content-Type', 'application/json')
      .send({ name: planttypename, watering: wateringpref })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('responds 400 when not all required fields provided in a body', done => {
    agent
      .put('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .send({ watering: wateringpref })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('changes the plant type name', done => {
    newplanttypename = planttypename + 'new';
    agent
      .put('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .send({ name: newplanttypename, fertilizing: fertilizingpref })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('changes were permanent', done => {
    agent
      .get('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body[0].name).to.equal(newplanttypename);
        //console.log(res.body);
        return done();
      });
  });
});

describe('removing plantTypes', () => {
  it('returns 400 if no _id provided', done => {
    agent
      .delete('/plantTypes')
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
      .delete('/plantTypes?_id=' + fakeplanttypeId)
      .set('Content-Type', 'application/json')
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('removes the plant by _id', done => {
    agent
      .delete('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('changes were permanent', done => {
    agent
      .get('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(0);
        return done();
      });
  });
});

describe('checking authorization', () => {
  it('creating a new planttype requires authentication', done => {
    body = {
      name: planttypename,
      watering: wateringpref,
      fertilizing: fertilizingpref
    };
    agentNotOk
      .post('/plantTypes')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('quering planttypes requires authentication', done => {
    agentNotOk
      .get('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('changing the planttype requires authentication', done => {
    newplanttypename = planttypename + 'new';
    agentNotOk
      .put('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .send({ name: newplanttypename, fertilizing: fertilizingpref })
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('removing the plant type requires authentication', done => {
    agentNotOk
      .delete('/plantTypes?_id=' + planttypeid)
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
