'use strict';

const expect = require('chai').expect;
const dbconnect = require('../server');
//const host = 'http://localhost:' + process.env.PORT;
const host =
  'http://planttrackerservice-planttrackerservice.a3c1.starter-us-west-1.openshiftapps.com';

var request = require('supertest');
var agent = request.agent(host);
var agentNotOk = request.agent(host);

var body;

describe('logging in', () => {
  it('return 400 if no credentials provided', done => {
    body = {};
    agent
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });

  it('responds 401 if wrong email provided', done => {
    body = {
      email: 'lalalla',
      password: process.env.USER_TEST_PASSWORD
    };
    agent
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('responds 400 if no email provided', done => {
    body = {
      password: process.env.USER_TEST_PASSWORD
    };
    agent
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });

  it('responds 401 if wrong password provided', done => {
    body = {
      email: process.env.USER_EMAIL,
      password: 'lalala'
    };
    agent
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('responds 400 if no password provided', done => {
    body = {
      email: process.env.USER_EMAIL
    };
    agent
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('responds 200 if login successfull', done => {
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
  it('responds 401 if trying to logout but not authorized', done => {
    agentNotOk
      .post('/logout')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
  it('logs out successfully', done => {
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
});
