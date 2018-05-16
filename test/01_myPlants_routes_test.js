'use strict';

const expect = require('chai').expect;
var request = require('supertest');
const host = 'http://localhost:60701';
const dbconnect = require('../server');

let body,
  plantname,
  newplantname,
  plantid,
  planttypeid,
  fakeplantId = '1119742c058b692566932709',
  fakeplanttypeid = '1119742c058b692566932709';

describe('loading Express', () => {
  before(done => {
    //Creating a plant
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
        return done();
      });
  });
  it('responds to /myPlants', done => {
    request(host)
      .get('/myPlants')
      .expect(200, done);
  }).timeout(500);
  it('404 everything else', done => {
    request(host)
      .get('/foo/bar')
      .expect(404, done);
  });
});
describe('adding new plants', () => {
  it('creates a new plant', done => {
    plantname =
      'mocha' +
      Math.random()
        .toString(36)
        .substring(7);
    body = { name: plantname, plantTypeId: planttypeid };
    request(host)
      .post('/myPlants')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        plantid = res.body._id;
        return done();
      });
  }).timeout(500);
  it('responds 400 if not all parameters were provided', done => {
    body = { name: plantname };
    request(host)
      .post('/myPlants')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it("responds 400 if plantTypeId doesn't exist", done => {
    body = { name: plantname, plantTypeId: fakeplanttypeid };
    request(host)
      .post('/myPlants')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  }).timeout(500);
});

describe('getting myPlants', () => {
  it('returns the plant specified with _id', done => {
    request(host)
      .get('/myPlants?_id=' + plantid)
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
      .get('/myPlants?name=' + plantname)
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
      .get('/myPlants?_id=' + fakeplantId)
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
      .get('/myPlants')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
});

describe('updating myPlants', () => {
  it('responds 404 when plantId not found', done => {
    request(host)
      .put('/myPlants?_id=' + fakeplantId)
      .set('Content-Type', 'application/json')
      .send({ name: plantname, plantTypeId: planttypeid })
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('responds 400 when no_id provided', done => {
    request(host)
      .put('/myPlants')
      .set('Content-Type', 'application/json')
      .send({ name: plantname, plantTypeId: planttypeid })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('responds 400 when not all fields provided in a body', done => {
    request(host)
      .put('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .send({ plantTypeId: planttypeid })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('returns 400 when wrong plantTypeId given', done => {
    request(host)
      .put('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .send({ name: plantname, plantTypeId: fakeplanttypeid })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('changes the plant name', done => {
    newplantname = plantname + 'new';
    request(host)
      .put('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .send({ name: newplantname, plantTypeId: planttypeid })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        return done();
      });
  });
  it('changes were permanent', done => {
    request(host)
      .get('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body[0].name).to.equal(newplantname);
        //console.log(res.body);
        return done();
      });
  });
});

describe('removing myPlants', () => {
  it('returns 400 if no _id provided', done => {
    request(host)
      .delete('/myPlants')
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
      .delete('/myPlants?_id=' + fakeplantId)
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
      .delete('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('changes were permanent', done => {
    request(host)
      .get('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).to.equal(0);
        return done();
      });
  });
});
