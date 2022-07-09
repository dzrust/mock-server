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
    const {dbRoute, needsUpdate} = createRoute(route)
    let firstResponseId = createResponses(route, dbRoute, results)
    if (dbRoute[0].currentExampleId === undefined && firstResponseId !== undefined) {
      dbRoute[0].currentExampleId = firstResponseId;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await dbRoute[0].save();
    }
  }
  return results;
};


const createRoute = (route) => {
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
  } catch (err) {
    results.failedRoutes.push({ postmanId: route.postmanId, error: err });
    return;
  }

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
  return {dbRoute, needsUpdate};
}

const createResponses = (route, dbRoute, results) => {
  let firstResponseId = undefined;
  for (let j = 0, lengthj = route.responses.length; j < lengthj; j++) {
    const response = route.responses[j];
    response.routeId = dbRoute[0].id;
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
}