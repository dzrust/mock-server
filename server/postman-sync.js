const { Response } = require("./schemas/response");
const { Route } = require("./schemas/route");

const createBaseResultsObject = () => ({
  createdRoutes: [],
  updatedRoutes: [],
  failedRoutes: [],
  createdResponses: [],
  updatedResponses: [],
  failedResponses: [],
});

exports.syncPostmanRoutes = async (routes) => {
  const results = createBaseResultsObject();
  for (let i = 0, { length } = routes; i < length; i++) {
    const route = routes[i];
    let needsUpdate = false;
    const result = await createRoute(route, results);
    const { dbRoute } = result;
    needsUpdate = result.needsUpdate;
    if (!dbRoute) continue;
    let firstResponseId = await createResponses(route, dbRoute, results);
    if (dbRoute.currentExampleId === undefined && firstResponseId !== undefined) {
      dbRoute.currentExampleId = firstResponseId;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await dbRoute.save();
    }
  }
  return results;
};

const createRoute = async (route, results) => {
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
    dbRoute = await Route.findOrCreate({
      defaults: routeToCreate,
      where: { defaultUrl: route.defaultUrl },
    });
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

const createResponses = async (route, dbRoute, results) => {
  let firstResponseId = undefined;
  for (let j = 0, lengthj = route.responses.length; j < lengthj; j++) {
    const response = route.responses[j];
    response.routeId = dbRoute.id;
    try {
      const dbResponse = await Response.findOrCreate({
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
        await dbResponse[0].save();
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
