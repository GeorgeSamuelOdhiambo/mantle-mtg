'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
//const config = require(__dirname + '/../config/config.json')[env];
const config = require('config');
const db = {};

function requireDynamically(path)
{
    path = path.split('\\').join('/'); // Normalize windows slashes
    return eval(`require('${path}');`); // Ensure Webpack does not analyze the require statement
}

let sequelize;
/*if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}*/
if(config.get("PGSSLMODE"))
{
    sequelize = new Sequelize(config.get('connection_string'),{
      "dialectOptions": {
        "ssl": {
          "require": true,
          "rejectUnauthorized": config.get("rejectUnauthorized")
        }
      }
    });
}
else{
  sequelize = new Sequelize(config.get('connection_string'));
}
const rootPath = path.join( process.cwd(), 'config', 'db')

fs
  .readdirSync(rootPath)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = requireDynamically(path.join(rootPath, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
