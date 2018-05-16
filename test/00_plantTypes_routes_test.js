'use strict';

const expect = require('chai').expect;
var request = require('supertest');
const host = 'http://localhost:60701';
const dbconnect = require('../server');

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
  it('responds to /plantTypes', done => {
    request(host)
      .get('/plantTypes')
      .expect(200, done);
  });
  it('404 everything else', done => {
    request(host)
      .get('/foo/bar')
      .expect(404, done);
  });
});
describe('adding new plant type', () => {
  it('creates a new plant', done => {
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
    request(host)
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
  }).timeout(500);

  it('responds 400 if not all required parameters were provided', done => {
    body = {
      watering: wateringpref,
      fertilizing: fertilizingpref
    };
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
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
    request(host)
      .delete('/plantTypes?_id=' + planttypeid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('changes were permanent', done => {
    request(host)
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
