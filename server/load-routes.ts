import { Request, Response, Application } from "express";
import { MockResponse } from "./models/response";
import { createResponse, getResponse } from "./schemas/response";
import { createRoute, getRouteByUrlAndMethod, updateRoute } from "./schemas/route";

const bypassRoute = process.env.BYPASS_ROUTE ?? "/mock-server/admin";

const routeNotInDb = (res: Response) => res.status(404).json({ error: "Route not in DB" });

const responseNotInDb = (res: Response) => res.status(404).json({ error: "Response not in DB" });

const handleNoRoute = async (req: Request, res: Response) => {
  try {
    const response: Omit<MockResponse, "id"> = {
      name: "New Response",
      statusCode: 404,
      response: JSON.stringify({}),
      headers: JSON.stringify({}),
    };
    const id = createRoute({
      name: "New Route",
      defaultUrl: req.originalUrl,
      url: req.originalUrl,
      method: req.method,
      responses: [response],
      curentExample: response,
    });
    createResponse();
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
          const response = getResponse(route.currentExampleId ?? "");
          if (!response) {
            const id = createResponse({
              name: "New Response",
              statusCode: 404,
              response: JSON.stringify({}),
              headers: JSON.stringify({}),
              routeId: route.id,
            });
            route.currentExampleId = id as any;
            updateRoute(route);
            responseNotInDb(res);
          } else {
            Object.keys(response.headers).forEach((header) => {
              res.append(header, response.headers[header]);
            });
            res.status(response.statusCode).json(response.response);
          }
        }
      } catch (err) {
        console.error(err);
        routeNotInDb(res);
      }
    })();
  });
};
