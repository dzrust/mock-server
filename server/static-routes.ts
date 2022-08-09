import { Application } from "express";
import { sendError } from "./error-handler";
import { createResponse, getResponsesByRouteId, updateResponse } from "./schemas/response";
import { bulkInsertPostmanRoutes, createRouteAndResponse, getRoutes, updateRoute } from "./schemas/route";

const bypassRoute = process.env.BYPASS_ROUTE ?? "/mock-server/admin";

export const loadStaticRoutes = (app: Application) => {
  app.get(`${bypassRoute}/routes`, (req, res) => {
    try {
      res.json(
        getRoutes().map((route) => ({
          ...route.toJSON(),
          responses: [],
          currentExample: (route.currentExample as any)?.toJSON(),
        })),
      );
    } catch (err) {
      sendError(req, res, err, { error: "Failed to get routes" });
    }
  });

  app.post(`${bypassRoute}/routes`, (req, res) => {
    try {
      createRouteAndResponse(req.body);
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
      res.json(
        responses.map((response) => ({
          ...response.toJSON(),
          response: JSON.parse(response.response),
          headers: JSON.parse(response.headers),
        })),
      );
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
      bulkInsertPostmanRoutes(req.body);
      res.status(200).end();
    } catch (err) {
      sendError(req, res, err, { error: "Failed to sync postman data" });
    }
  });
};
