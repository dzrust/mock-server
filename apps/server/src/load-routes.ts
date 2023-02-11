import { Request, Response, Application } from "express";
import { createResponse } from "./schemas/response";
import { createRouteAndResponse, getRouteByUrlAndMethod } from "./schemas/route";

const bypassRoute = "/mock-server/admin";

const routeNotInDb = (res: Response) => res.status(404).json({ error: "Route not in DB" });

const responseNotInDb = (res: Response) => res.status(404).json({ error: "Response not in DB" });

const handleNoRoute = async (req: Request, res: Response) => {
  try {
    createRouteAndResponse({
      name: "New Route",
      defaultUrl: req.originalUrl,
      method: req.method,
    });
    routeNotInDb(res);
  } catch (err) {
    console.error(err);
    routeNotInDb(res);
  }
};

export const loadRoutesFromDB = (app: Application) => {
  app.all("*", (req, res, next) => {
    if (req.originalUrl.indexOf(bypassRoute) > -1) {
      next();
      return;
    }
    (async () => {
      try {
        const route = getRouteByUrlAndMethod(req.originalUrl, req.method);
        if (!route) {
          handleNoRoute(req, res);
        } else {
          if (!route.currentExample) {
            createResponse({
              name: "New Response",
              statusCode: 404,
              response: JSON.stringify({}),
              headers: JSON.stringify({}),
              routeId: route.id,
            });
            responseNotInDb(res);
          } else {
            const headers = JSON.parse(route.currentExample.headers ?? {});
            Object.keys(headers).forEach((header) => {
              res.append(header, headers[header]);
            });
            res.status(route.currentExample.statusCode).json(JSON.parse(route.currentExample.response));
          }
        }
      } catch (err) {
        console.error(err);
        routeNotInDb(res);
      }
    })();
  });
};
