import { PostmanBulkInsertResult } from "./models/postman-bulk-insert-result";
import { PostmanRoute } from "./models/postman-route";
import { upsertRoute } from "./schemas/route";

const createBaseResultsObject = (): PostmanBulkInsertResult => ({
  createdRoutes: [],
  updatedRoutes: [],
  failedRoutes: [],
  createdResponses: [],
  updatedResponses: [],
  failedResponses: [],
});

export const syncPostmanRoutes = (routes: PostmanRoute[]) => {
  const results = createBaseResultsObject();
  for (let i = 0, { length } = routes; i < length; i++) {
    const route = routes[i];
    let needsUpdate = false;
    const result = createRoute(route, results);
    const { dbRoute } = result;
    needsUpdate = result.needsUpdate;
    if (!dbRoute) continue;
    let firstResponseId = createResponses(route, dbRoute, results);
    if (dbRoute.currentExampleId === undefined && firstResponseId !== undefined) {
      dbRoute.currentExampleId = firstResponseId;
      needsUpdate = true;
    }
    if (needsUpdate) {
      dbRoute.save();
    }
  }
  return results;
};

export const createRoute = (route: PostmanRoute, results: PostmanBulkInsertResult) => {
  const routeToCreate = {
    name: route.name,
    defaultUrl: route.defaultUrl,
    url: route.url,
    method: route.method,
    postmanId: route.postmanId,
  };
  let dbRoute;
  let needsUpdate = false;
  try {
    upsertRoute(routeToCreate);
    if (dbRoute[1]) {
      results.createdRoutes.push(route.postmanId);
    } else {
      results.updatedRoutes.push(route.postmanId);
      dbRoute[0].name = route.name;
      dbRoute[0].defaultUrl = route.defaultUrl;
      dbRoute[0].method = route.method;
      dbRoute[0].postmanId = route.postmanId;
      needsUpdate = true;
    }
  } catch (err) {
    results.failedRoutes.push({ postmanId: route.postmanId, error: err });
  }

  return { dbRoute: dbRoute[0], needsUpdate };
};

export const createResponses = (route: PostmanRoute, dbRoute, results: PostmanBulkInsertResult) => {
  let firstResponseId = undefined;
  for (let j = 0, lengthj = route.responses.length; j < lengthj; j++) {
    const response = route.responses[j];
    response.routeId = dbRoute.id;
    try {
      const dbResponse = Response.findOrCreate({
        defaults: response,
        where: { postmanId: response.postmanId },
      });
      if (!dbResponse[1]) {
        dbResponse[0].name = response.name;
        dbResponse[0].statusCode = response.statusCode;
        dbResponse[0].response = response.response;
        dbResponse[0].headers = response.headers;
        dbResponse[0].postmanId = response.postmanId;
        dbResponse[0].routeId = dbRoute[0].id;
        dbResponse[0].save();
        results.updatedResponses.push(response.postmanId);
      } else {
        results.createdResponses.push(response.postmanId);
      }
      if (firstResponseId === undefined) {
        firstResponseId = dbResponse[0].id;
      }
    } catch (err) {
      results.failedResponses.push({ postmanId: response.postmanId, error: err });
    }
  }
  return firstResponseId;
};
