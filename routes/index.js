// routes/index.js

const path = process.env.ROUTE_PATH;
//Change for openshift
const myPlantsRoutes = require(path + '/myPlants_routes.js');
const eventsRoutes = require(path + '/events_routes.js');
const plantTypesRoutes = require(path + '/plantTypes_routes.js');
const loginRoutes = require(path + '/login_routes.js');

module.exports = function(app, db) {
  myPlantsRoutes(app, db);
  eventsRoutes(app, db);
  plantTypesRoutes(app, db);
  loginRoutes(app, db);
};
