import { CollectionFolder, CollectionTemplate, CollectionRequestResponse, CollectionRequest } from "./collection";
import { MockRoute } from "./route";
import { MockResponse } from "./response";

export type PostmanRoute = {
  responses: MockResponse[];
} & MockRoute;

export const transformCollectionToRoutes = (item: (CollectionFolder | CollectionTemplate)[]): PostmanRoute[] => {
  const postmanRoutes: PostmanRoute[] = [];
  item.forEach((postmanItem) => {
    if ((postmanItem as CollectionFolder).item !== undefined) {
      const newRoutes = transformCollectionToRoutes((postmanItem as CollectionFolder).item);
      newRoutes.forEach((route) => {
        const duplicateEntryIndex = postmanRoutes.findIndex(
          (currentRoute) => currentRoute.defaultUrl === route.defaultUrl && currentRoute.method === route.method,
        );
        if (duplicateEntryIndex > -1) {
          console.log("consider delete from postman", route);
          postmanRoutes[duplicateEntryIndex].responses = [
            ...postmanRoutes[duplicateEntryIndex].responses,
            ...route.responses,
          ];
        } else {
          postmanRoutes.push(route);
        }
      });
    } else {
      const postmanRoute = transformCollectionRouteToPostmanRoute(
        postmanItem.id,
        postmanItem.name,
        (postmanItem as CollectionTemplate).request,
      );
      const { newRoutes, responses } = getRoutesFromResponses(postmanItem as CollectionTemplate);
      postmanRoute.responses = responses;
      postmanRoutes.push(...newRoutes);
      postmanRoutes.push(postmanRoute);
    }
  });
  return postmanRoutes;
};

export const getRoutesFromResponses = (
  collectionTemplate: CollectionTemplate,
): { newRoutes: PostmanRoute[]; responses: MockResponse[] } => {
  const newRoutes: PostmanRoute[] = [];
  const newRoutesMap: Map<string, PostmanRoute> = new Map<string, PostmanRoute>();
  const responses: MockResponse[] = [];
  const url = getUrlFromPostmanRequest(collectionTemplate.request);
  collectionTemplate.response.forEach((response) => {
    const responseUrl = getUrlFromPostmanRequest(response.originalRequest);
    if (url !== responseUrl) {
      const newRoute =
        newRoutesMap.get(responseUrl) ??
        transformCollectionRouteToPostmanRoute(
          collectionTemplate.id,
          collectionTemplate.name,
          response.originalRequest,
        );
      newRoute.responses = [...newRoute.responses, transformCollectionResponseToPostmanRouteResponse(response)];
      newRoutesMap.set(responseUrl, newRoute);
    } else {
      responses.push(transformCollectionResponseToPostmanRouteResponse(response));
    }
  });
  newRoutesMap.forEach((route) => {
    newRoutes.push(route);
  });
  return {
    newRoutes,
    responses,
  };
};

export const getUrlFromPostmanRequest = (collectionRequest: CollectionRequest) => {
  const variables = getCollectionRequestUrlVariables(collectionRequest);
  const queryString = getCollectionRequestUrlQueryString(collectionRequest);
  const url =
    "/" +
    collectionRequest.url.path
      .map((pathPart) => encodeURIComponent(variables.has(pathPart) ? variables.get(pathPart)! : pathPart))
      .join("/") +
    queryString;
  return url;
};

export const getCollectionRequestUrlVariables = (collectionRequest: CollectionRequest): Map<string, string> => {
  const variableMap = new Map<string, string>();
  (collectionRequest.url.variable ?? []).forEach((variable) => {
    variableMap.set(`:${variable.key}`, variable.value);
  });
  return variableMap;
};

export const getCollectionRequestUrlQueryString = (collectionRequest: CollectionRequest): string => {
  let queryString = "";
  (collectionRequest.url.query ?? []).forEach((param, index) => {
    queryString += `${index === 0 ? "?" : "&"}${param.key}=${encodeURIComponent(param.value)}`;
  });
  return queryString;
};

export const transformCollectionRouteToPostmanRoute = (
  id: string,
  name: string,
  collectionRequest: CollectionRequest,
): PostmanRoute => {
  const url = getUrlFromPostmanRequest(collectionRequest);
  return {
    name: name,
    defaultUrl: url,
    method: collectionRequest.method,
    responses: [] as MockResponse[],
    postmanId: id,
  } as PostmanRoute;
};

export const transformCollectionResponseToPostmanRouteResponse = (
  collectionRequestResponse: CollectionRequestResponse,
): MockResponse => {
  const headers = {} as any;
  (collectionRequestResponse.header ?? []).forEach((header) => {
    headers[header.key] = header.value;
  });
  let response = {};
  try {
    response = JSON.parse(collectionRequestResponse.body ?? "{}") ?? {};
  } catch (err) {
    response = {};
  }
  return {
    name: collectionRequestResponse.name ?? "New Response",
    statusCode: collectionRequestResponse.code ?? 200,
    response,
    headers,
    postmanId: collectionRequestResponse.id,
  } as MockResponse;
};
