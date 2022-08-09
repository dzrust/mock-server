import { UpdateMode } from "realm";
import { getRealm } from "../models/database";
import { MockRoute } from "../models/route";
const { UUID } = Realm.BSON;

export const RouteSchema = {
  name: "Route",
  properties: {
    defaultUrl: { type: "string", index: true },
    url: { type: "string?", index: true },
    name: "string",
    method: "string?",
    postmanId: "string?",
    currentExample: "Response?",
    responses: "Response[]",
  },
  primaryKey: "defaultUrl",
};

export const getRoute = (defaultUrl: string) => {
  return getRealm().objectForPrimaryKey<MockRoute>(RouteSchema.name, defaultUrl);
};

export const getRouteByUrlAndMethod = (url: string, method: string) => {
  const routes = getRealm().objects<MockRoute>(RouteSchema.name);
  const route = routes.filtered(`(defaultUrl == ${url} || url == url) && method == ${method}`);
  return route[0];
};

export const getRoutes = () => {
  return getRealm().objects<MockRoute>(RouteSchema.name);
};

export const createRoute = (route: MockRoute) => {
  getRealm().write(() => {
    getRealm().create(RouteSchema.name, route, UpdateMode.Never);
  });
};

export const updateRoute = (route: MockRoute) => {
  getRealm().write(() => {
    const routeUpdate = getRealm().objectForPrimaryKey<MockRoute>(RouteSchema.name, route.defaultUrl);
    if (routeUpdate) {
      if (!route.postmanId) {
        routeUpdate.name = route.name;
        routeUpdate.method = route.method;
      }
      routeUpdate.url = route.url;
      routeUpdate.postmanId = route.postmanId;
    }
  });
};

export const upsertRoute = (route: MockRoute) => {
  getRealm().write(() => {
    getRealm().create(RouteSchema.name, route, UpdateMode.Modified);
  });
};

export const deleteRoute = (id: number) => {
  getRealm().write(() => {
    const routeDelete = getRealm().objectForPrimaryKey<MockRoute>(RouteSchema.name, id);
    getRealm().delete(routeDelete);
  });
};
