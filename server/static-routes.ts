import { Application } from "express";
import { sendError } from "./error-handler";
import { syncPostmanRoutes } from "./postman-sync";
import { createResponse, getResponsesByRouteId, updateResponse } from "./schemas/response";
import { createRoute, getRoutes, updateRoute } from "./schemas/route";

const bypassRoute = process.env.BYPASS_ROUTE ?? "/mock-server/admin";

export const loadStaticRoutes = (app: Application) => {
  app.get(`${bypassRoute}/routes`, (req, res) => {
    try {
      res.json(getRoutes());
    } catch (err) {
      sendError(req, res, err, { error: "Failed to get routes" });
    }
  });

  app.post(`${bypassRoute}/routes`, (req, res) => {
    try {
      createRoute(req.body);
      res.status(200).end();
    } catch (err) {
      sendError(req, res, err, { error: "Failed to create route" });
    }
  });

  app.put(`${bypassRoute}/routes/:id`, (req, res) => {
    try {
      updateRoute(req.body);
      res.status(200).end();
    } catch (err) {
      sendError(req, res, err, { error: "Failed to update route" });
    }
  });

  app.get(`${bypassRoute}/routes/:id/responses`, (req, res) => {
    try {
      const responses = getResponsesByRouteId(req.params.id);
      res.json(responses);
    } catch (err) {
      sendError(req, res, err, { error: "Failed to get responses" });
    }
  });

  app.post(`${bypassRoute}/routes/:id/responses`, (req, res) => {
    try {
      createResponse(req.body);
      res.status(200).end();
    } catch (err) {
      sendError(req, res, err, { error: "Failed to create response" });
    }
  });

  app.put(`${bypassRoute}/routes/:id/responses/:responseId`, (req, res) => {
    try {
      updateResponse(req.body);
      res.status(200).end();
    } catch (err) {
      sendError(req, res, err, { error: "Failed to update response" });
    }
  });

  app.post(`${bypassRoute}/postman/sync`, (req, res) => {
    try {
      syncPostmanRoutes(req.body);
      res.status(200).end();
    } catch (err) {
      sendError(req, res, err, { error: "Failed to sync postman data" });
    }
  });
};
