var DataTypes = require("sequelize").DataTypes;
var _MantleMTG = require("./MantleMTG");


function initModels(sequelize) {
  
  var MantleMTG = _MantleMTG(sequelize, DataTypes);
  

  return {
    MantleMTG,
    
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

