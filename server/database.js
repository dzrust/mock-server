const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("app_db", "db_user", "db_user_pass", {
  host: "db",
  port: 3306,
  dialect: "mysql",
  logging: function () {},
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

exports.database = sequelize;
