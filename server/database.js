const { Sequelize } = require("sequelize");

const DB_CONNECTION = {
  database: process.env.DATABASE ?? "app_db",
  user: process.env.DATABASE_USERNAME ?? "db_user",
  password: process.env.DATABASE_PASSWORD ?? "db_user_pass",
  host: process.env.HOST ?? "db",
  port: parseInt(process.env.PORT ?? "3306"),
};

const sequelize = new Sequelize(DB_CONNECTION.database, DB_CONNECTION.user, DB_CONNECTION.password, {
  host: DB_CONNECTION.host,
  port: DB_CONNECTION.port,
  dialect: "mysql",
  logging: function () {},
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

exports.database = sequelize;
