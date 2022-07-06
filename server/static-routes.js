const express = require("express");
const { database } = require("./database");
const { sendError } = require("./error-handler");
const { saveRoutes } = require("./postman-sync");
const { Response } = require("./schemas/response");
const { Route } = require("./schemas/route");
const loadStaticRoutes = (app) => {
  app.use("/ent/admin", express.static("public"));
  app.post("/ent/admin/sync", (req, res) => {
    database
      .sync({ force: true })
      .then(() => res.status(200).end())
      .catch((err) => sendError(req, res, err, { error: "failed to sync" }));
  });
  app.get("/ent/admin/routes", (req, res) => {
    Route.findAll()
      .then((routes) => {
        res.json(routes);
      })
      .catch((err) => sendError(req, res, err, { error: "Failed to get routes" }));
  });

  app.post("/ent/admin/routes", (req, res) => {
    Route.create(req.body)
      .then(() => res.status(200).end())
      .catch((err) => sendError(req, res, err, { error: "Failed to create route" }));
  });

  app.put("/ent/admin/routes/:id", (req, res) => {
    Route.update(req.body, { where: { id: req.body.id } })
      .then(() => res.status(200).end())
      .catch((err) => sendError(req, res, err, { error: "Failed to update route" }));
  });

  app.get("/ent/admin/routes/:id/responses", (req, res) => {
    Response.findAll({
      where: {
        routeId: req.params.id,
      },
    })
      .then((responses) => {
        res.json(responses);
      })
      .catch((err) => sendError(req, res, err, { error: "Failed to get responses" }));
  });

  app.post("/ent/admin/routes/:id/responses", (req, res) => {
    Response.create(req.body)
      .then(() => res.status(200).end())
      .catch((err) => sendError(req, res, err, { error: "Failed to create response" }));
  });

  app.put("/ent/admin/routes/:id/responses/:responseId", (req, res) => {
    Response.update(req.body, { where: { id: req.body.id } })
      .then(() => res.status(200).end())
      .catch((err) => sendError(req, res, err, { error: "Failed to update response" }));
  });

  app.post("/ent/admin/postman/sync", (req, res) => {
    saveRoutes(req.body)
      .then((results) => {
        res.status(200).json(results);
      })
      .catch((err) => {
        sendError(req, res, err, { error: "Failed to sync postman data" });
      });
  });
};

exports.loadStaticRoutes = loadStaticRoutes;