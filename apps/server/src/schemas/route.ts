import { UpdateMode } from "realm";
import { getRealm } from "../models/database";
import { PostmanRoute } from "../models/postman-route";
import { MockResponse } from "../models/response";
import { MockRoute } from "../models/route";

const { UUID } = Realm.BSON;

export const RouteSchema = {
  name: "Route",
  properties: {
    id: "uuid",
    defaultUrl: { type: "string", index: true },
    url: { type: "string?", index: true },
    name: "string",
    method: "string?",
    postmanId: "string?",
    currentExample: "Response?",
    responses: "Response[]",
  },
  primaryKey: "id",
};

export const getRoute = (id: string) => {
  return getRealm().objectForPrimaryKey<MockRoute>(RouteSchema.name, new UUID(id));
};

export const getRouteByUrlAndMethod = (url: string, method: string) => {
  const routes = getRealm().objects<MockRoute>(RouteSchema.name);
  const route = routes.filtered(`(defaultUrl == '${url}' || url == '${url}') && method == '${method}'`);
  return route[0];
};

export const getRoutes = () => {
  return getRealm().objects<MockRoute>(RouteSchema.name);
};

export const createRouteAndResponse = (route: Omit<MockRoute, "id" | "responses" | "currentExample">) => {
  const id = new UUID() as any;
  const responseId = new UUID() as any;
  const response: MockResponse = {
    id: responseId,
    name: "New Response",
    statusCode: 404,
    response: JSON.stringify({}),
    headers: JSON.stringify({}),
    routeId: id,
  };
  getRealm().write(() => {
    const routes = getRealm().objects<MockRoute>(RouteSchema.name);
    const testRoute = routes.filtered(
      `(defaultUrl == '${route.defaultUrl}' || url == '${route.url}') && method == '${route.method}'`,
    );
    if (testRoute.length === 0) {
      const newRoute = getRealm().create<MockRoute>(
        RouteSchema.name,
        {
          ...route,
          id,
          responses: [],
        },
        UpdateMode.Never,
      );
      newRoute.responses = [response];
      newRoute.currentExample = response;
    } else {
      throw new Error("Route already exists in the database with that url or defaultUrl");
    }
  });
};

export const createRoute = (route: MockRoute) => {
  const id = new UUID();
  getRealm().write(() => {
    const routes = getRealm().objects<MockRoute>(RouteSchema.name);
    const testRoute = routes.filtered(
      `(defaultUrl == '${route.url}' || url == '${route.url}') && method == '${route.method}'`,
    );
    if (testRoute.length === 0) {
      getRealm().create(
        RouteSchema.name,
        {
          ...route,
          id,
          responses: (route.responses ?? []).map((response) => ({
            ...response,
            id: new UUID(),
            response: JSON.stringify(response.response),
            headers: JSON.stringify(response.headers ?? {}),
            routeId: id,
          })),
        },
        UpdateMode.Never,
      );
    } else {
      throw new Error("Route already exists in the database with that url or defaultUrl");
    }
  });
  return id;
};

export const updateRoute = (route: MockRoute) => {
  getRealm().write(() => {
    const routeUpdate = getRealm().objectForPrimaryKey<MockRoute>(RouteSchema.name, new UUID(route.id));
    if (routeUpdate) {
      if (!route.postmanId) {
        routeUpdate.name = route.name;
        routeUpdate.method = route.method;
      }
      routeUpdate.url = route.url;
      routeUpdate.postmanId = route.postmanId;
      if (route.currentExample) {
        routeUpdate.currentExample = {
          ...route.currentExample,
          id: new UUID(route.currentExample.id) as any,
          response: JSON.stringify(route.currentExample.response),
          headers: JSON.stringify(route.currentExample.headers ?? {}),
          routeId: new UUID(route.id) as any,
        };
      }
    }
  });
};

export const upsertRoute = (route: MockRoute) => {
  getRealm().write(() => {
    const routes = getRealm().objects<MockRoute>(RouteSchema.name);
    const testRoute = routes.filtered(
      `(defaultUrl == '${route.url}' || url == '${route.url}') && method == '${route.method}'`,
    );
    if (testRoute.length > 1 || testRoute[0].id !== route.id) {
      throw new Error("Route already exists in the database with that url or defaultUrl");
    }
    getRealm().create(RouteSchema.name, route, UpdateMode.Modified);
  });
};

export const deleteRoute = (id: number) => {
  getRealm().write(() => {
    const routeDelete = getRealm().objectForPrimaryKey<MockRoute>(RouteSchema.name, id);
    getRealm().delete(routeDelete);
  });
};

export const bulkInsertPostmanRoutes = (routes: PostmanRoute[]) => {
  getRealm().write(() => {
    for (let i = 0, { length } = routes; i < length; i++) {
      const route = routes[i];
      const routeInDB = getRouteByUrlAndMethod(route.defaultUrl, route.method);
      const routeId = routeInDB?.id ?? new UUID();
      const responses = [
        ...route.responses.map((response) => ({
          ...response,
          id: new UUID(),
          response: JSON.stringify(response.response),
          headers: JSON.stringify(response.headers ?? {}),
          routeId: routeId,
        })),
        ...(routeInDB?.responses ?? []).filter((response) => !response.postmanId),
      ];
      getRealm().create(
        RouteSchema.name,
        {
          id: routeId,
          name: route.name,
          defaultUrl: route.defaultUrl,
          url: route.url,
          method: route.method,
          postmanId: route.postmanId,
          responses,
          currentExample: responses[0],
        },
        UpdateMode.Modified,
      );
    }
  });
};
