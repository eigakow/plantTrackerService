'use strict';

const expect = require('chai').expect;
const dbconnect = require('../server');
let host;
if (process.env.TEST_ENV === 'dev') {
  host = 'http://localhost:' + process.env.PORT;
} else {
  host =
    'http://planttrackerservice-planttrackerservice.a3c1.starter-us-west-1.openshiftapps.com';
}
var request = require('supertest');
var agent = request.agent(host);
var agentNotOk = request.agent(host);

let body,
  plantname,
  newplantname,
  plantid,
  planttypeid,
  fakeplantId = '1119742c058b692566932709',
  fakeplanttypeid = '1119742c058b692566932709';

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
  //Creating a plant
  it('creates plants', done => {
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
        return done();
      });
  });
  it('responds to /myPlants', done => {
    agent.get('/myPlants').expect(200, done);
  });
  it('404 everything else', done => {
    agent.get('/foo/bar').expect(404, done);
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
    agent
      .post('/myPlants')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        plantid = res.body._id;
        return done();
      });
  });
  it('responds 400 if not all parameters were provided', done => {
    body = { name: plantname };
    agent
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
    agent
      .post('/myPlants')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
});

describe('getting myPlants', () => {
  it('returns the plant specified with _id', done => {
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
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
    agent
      .delete('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('changes were permanent', done => {
    agent
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

describe('checking authorization', () => {
  it('creating a new plant requires authorization', done => {
    body = { name: plantname, plantTypeId: planttypeid };
    agentNotOk
      .post('/myPlants')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('quering plants requires authorization', done => {
    agentNotOk
      .get('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('changing the plant requires authorization', done => {
    newplantname = plantname + 'new';
    agentNotOk
      .put('/myPlants?_id=' + plantid)
      .set('Content-Type', 'application/json')
      .send({ name: newplantname, plantTypeId: planttypeid })
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('removing the plant requires authorization', done => {
    agentNotOk
      .delete('/myPlants?_id=' + plantid)
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
