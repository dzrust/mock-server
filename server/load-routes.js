const { Route } = require("./schemas/route");
const { Op } = require("sequelize");
const { Response } = require("./schemas/response");
const bypassRoute = process.env.BYPASS_ROUTE ?? "/mock-server/admin";

const loadRoute = async (url, method) => {
  const route = await Route.findOne({
    where: {
      [Op.or]: [{ defaultUrl: url }, { url: url }],
      method: method,
    },
  });
  return route;
};

const loadRouteResponse = async (route) => {
  const response = await Response.findByPk(route.currentExampleId);
  return response;
};

const createRoute = async (req) => {
  return await Route.create({
    name: "New Route",
    defaultUrl: req.originalUrl,
    url: req.originalUrl,
    method: req.method,
  });
};

const createResponse = async (route) => {
  const response = await Response.findOrCreate({
    defaults: {
      name: "New Response",
      statusCode: 404,
      response: {},
      headers: {},
      routeId: route.id,
    },
    where: {
      routeId: route.id,
    },
  });
  if (route.currentExampleId === undefined) {
    route.currentExampleId = response[0].id;
    await route.save();
  }
};

const routeNotInDb = (res) => res.status(404).json({ error: "Route not in DB" });

const responseNotInDb = (res) => res.status(404).json({ error: "Response not in DB" });

const handleNoRoute = async (req, res) => {
  try {
    const route = await createRoute(req);
    await createResponse(route);
    routeNotInDb(res);
  } catch (err) {
    console.error(err);
    routeNotInDb(res);
  }
};

const loadRoutesFromDB = (app) => {
  app.all("*", (req, res, next) => {
    if (req.originalUrl.indexOf(bypassRoute) > -1) {
      next();
      return;
    }
    (async () => {
      try {
        const route = await loadRoute(req.originalUrl, req.method);
        if (route === null) {
          handleNoRoute(req, res);
        } else {
          const response = await loadRouteResponse(route);
          if (response === null) {
            await createResponse(route);
            responseNotInDb(res);
            return;
          } else {
            Object.keys(response.headers).forEach((header) => {
              res.append(header, response.headers[header]);
            });
            res.status(response.statusCode).json(response.response);
            return;
          }
        }
      } catch (err) {
        console.error(err);
        routeNotInDb(res);
      }
    })();
  });
};

exports.loadRoutesFromDB = loadRoutesFromDB;
