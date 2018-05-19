// routes/index.js
const myPlantsRoutes = require('./MyPlants_routes.js');
const eventsRoutes = require('./events_routes.js');
const plantTypesRoutes = require('./plantTypes_routes.js');

module.exports = function(app, db) {
  myPlantsRoutes(app, db);
  eventsRoutes(app, db);
  plantTypesRoutes(app, db);
};
