const { DataTypes } = require("sequelize");
const { database } = require("../database");

const Response = database.define("Response", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Model attributes are defined here
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  response: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  headers: {
    type: DataTypes.JSON,
  },
  postmanId: {
    type: DataTypes.STRING,
  },
  routeId: {
    type: DataTypes.INTEGER,
  },
});

exports.Response = Response;
