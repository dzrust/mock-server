import { getRealm } from "../models/database";
import { MockResponse } from "../models/response";
import { getRoute } from "./route";

const { UUID } = Realm.BSON;

export const ResponseSchema = {
  name: "Response",
  properties: {
    id: "uuid",
    name: "string",
    statusCode: "int",
    response: "string",
    headers: "string",
    postmanId: "string?",
    routeId: "uuid",
  },
  primaryKey: "id",
};

export const getResponse = (id: string) => {
  return getRealm().objectForPrimaryKey<MockResponse>(ResponseSchema.name, new UUID(id));
};

export const getResponses = () => {
  return getRealm().objects<MockResponse>(ResponseSchema.name);
};

export const getResponsesByRouteId = (routeId: string) => {
  const responses = getRealm().objects<MockResponse>(ResponseSchema.name);
  return responses.filtered(`routeId == uuid(${routeId})`);
};

export const createResponse = (response: Omit<MockResponse, "id">) => {
  const id: any = new UUID();
  const mockResponse = {
    ...response,
    id,
    response: JSON.stringify(response.response),
    headers: JSON.stringify(response.headers ?? {}),
    routeId: new UUID(response.routeId) as any,
  } as MockResponse;
  getRealm().write(() => {
    const route = getRoute(response.routeId);
    if (!route) {
      throw new Error("Failed to find route");
    }
    route.responses.push(mockResponse);
    if (!route.currentExample) {
      route.currentExample = mockResponse;
    }
  });
  return id;
};

export const updateResponse = (response: MockResponse) => {
  if (response.postmanId) {
    throw new Error("You cannot update a response from postman");
  }
  getRealm().write(() => {
    const route = getRoute(response.routeId);
    if (!route) {
      throw new Error("Failed to find route");
    }
    for (let i = 0, { length } = route.responses; i < length; i++) {
      if (new UUID(route.responses[i].id).equals(response.id)) {
        route.responses[i].name = response.name;
        route.responses[i].headers = JSON.stringify(response.headers ?? {});
        route.responses[i].statusCode = response.statusCode;
        route.responses[i].response = JSON.stringify(response.response);
        return;
      }
    }
  });
};

export const upsertResponse = (response: MockResponse) => {
  const id = response.id ?? new UUID();
  const mockResponse = {
    ...response,
    id,
    response: JSON.stringify(response.response),
    headers: JSON.stringify(response.headers ?? {}),
    routeId: new UUID(response.routeId) as any,
  } as MockResponse;
  getRealm().write(() => {
    const route = getRoute(response.routeId);
    if (!route) {
      throw new Error("Failed to find route");
    }
    for (let i = 0, { length } = route.responses; i < length; i++) {
      if (new UUID(route.responses[i].id).equals(response.id) && !route.responses[i].postmanId) {
        route.responses[i].name = response.name;
        route.responses[i].headers = JSON.stringify(response.headers ?? {});
        route.responses[i].statusCode = response.statusCode;
        route.responses[i].response = JSON.stringify(response.response);
        return;
      }
      if (route.responses[i].id === response.id && route.responses[i].postmanId) {
        throw new Error("You cannot update a response from postman");
      }
    }
    route.responses.push(mockResponse);
    if (!route.currentExample) {
      route.currentExample = mockResponse;
    }
  });
  return id;
};

export const deleteResponse = (id: number) => {
  getRealm().write(() => {
    const routeDelete = getRealm().objectForPrimaryKey<MockResponse>(ResponseSchema.name, id);
    getRealm().delete(routeDelete);
  });
};
