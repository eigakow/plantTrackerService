// routes/index.js
const myPlantsRoutes = require('./MyPlants_routes');
const eventsRoutes = require('./events_routes');
const plantTypesRoutes = require('./plantTypes_routes');

module.exports = function(app, db) {
  myPlantsRoutes(app, db);
  eventsRoutes(app, db);
  plantTypesRoutes(app, db);
};
