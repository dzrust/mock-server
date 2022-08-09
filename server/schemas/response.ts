import { UpdateMode } from "realm";
import { getRealm } from "../models/database";
import { Response as MockResponse } from "../models/response";
import { getRoute } from "./route";

const { UUID } = Realm.BSON;

export const ResponseSchema = {
  name: "Response",
  properties: {
    id: "int",
    name: "string",
    statusCode: "int",
    response: "string",
    headers: "string",
    postmanId: "string?",
    routeId: "int?",
  },
  primaryKey: "id",
};

export const getResponse = (id: string) => {
  return getRealm().objectForPrimaryKey<MockResponse>(ResponseSchema.name, id);
};

export const getResponses = () => {
  return getRealm().objects<MockResponse>(ResponseSchema.name);
};

export const getResponsesByRouteId = (routeId: string) => {
  const responses = getRealm().objects(ResponseSchema.name);
  return responses.filtered(`routeId == ${routeId}`);
};

export const createResponse = (response: Omit<MockResponse, "id">) => {
  const id: any = new UUID();
  const mockResponse = { ...response, id } as MockResponse;
  getRealm().write(() => {
    const route = getRoute(mockResponse.routeId);
    if (!route) {
      throw "Failed to find route";
    }
    route.responses.push(mockResponse);
    if (!route.curentExample) {
      route.curentExample = mockResponse;
    }
    getRealm().create(ResponseSchema.name, { ...response, id }, UpdateMode.Never);
  });
  return id;
};

export const updateResponse = (response: MockResponse) => {
  getRealm().write(() => {
    const routeUpdate = getRealm().objectForPrimaryKey<MockResponse>(ResponseSchema.name, response.id);
    if (routeUpdate && !response.postmanId) {
      routeUpdate.name = response.name;
      routeUpdate.headers = response.headers;
      routeUpdate.statusCode = response.statusCode;
      routeUpdate.response = response.response;
    }
  });
};

export const upsertResponse = (response: MockResponse) => {
  const id = response.id ?? new UUID();
  getRealm().write(() => {
    getRealm().create(ResponseSchema.name, { ...response, id }, UpdateMode.Modified);
  });
  return id;
};

export const deleteResponse = (id: number) => {
  getRealm().write(() => {
    const routeDelete = getRealm().objectForPrimaryKey<MockResponse>(ResponseSchema.name, id);
    getRealm().delete(routeDelete);
  });
};
