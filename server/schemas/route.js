const { DataTypes, Deferrable } = require("sequelize");
const { database } = require("../database");
const { Response } = require("./response");

const Route = database.define("Route", {
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
  defaultUrl: {
    type: DataTypes.STRING(750),
    allowNull: false,
    unique: true,
  },
  url: {
    type: DataTypes.STRING(750),
    unique: true,
  },
  method: {
    type: DataTypes.STRING,
  },
  postmanId: {
    type: DataTypes.STRING,
  },
  currentExampleId: {
    type: DataTypes.INTEGER,
    references: {
      // This is a reference to another model
      model: Response,

      // This is the column name of the referenced model
      key: "id",

      // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
      deferrable: Deferrable.INITIALLY_IMMEDIATE,
      // Options:
      // - `Deferrable.INITIALLY_IMMEDIATE` - Immediately check the foreign key constraints
      // - `Deferrable.INITIALLY_DEFERRED` - Defer all foreign key constraint check to the end of a transaction
      // - `Deferrable.NOT` - Don't defer the checks at all (default) - This won't allow you to dynamically change the rule in a transaction
    },
  },
});

exports.Route = Route;
