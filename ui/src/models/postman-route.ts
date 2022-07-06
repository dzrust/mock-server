import { CollectionFolder, CollectionTemplate, CollectionRequestResponse, CollectionRequest } from "./collection";
import { Route } from "./route";
import { Response } from "./response";

export type PostmanRoute = {
  responses: Response[];
} & Route;

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
  item: CollectionTemplate,
): { newRoutes: PostmanRoute[]; responses: Response[] } => {
  const newRoutes: PostmanRoute[] = [];
  const newRoutesMap: Map<string, PostmanRoute> = new Map<string, PostmanRoute>();
  const responses: Response[] = [];
  const url = getUrlFromPostmanRequest(item.request);
  item.response.forEach((response) => {
    const responseUrl = getUrlFromPostmanRequest(response.originalRequest);
    if (url !== responseUrl) {
      const newRoute =
        newRoutesMap.get(responseUrl) ??
        transformCollectionRouteToPostmanRoute(item.id, item.name, response.originalRequest);
      newRoute.responses = [...newRoute.responses, transformCollectionResponseToPostmanRouteResponse(response)];
      newRoutesMap.set(responseUrl, newRoute);
    } else {
      responses.push(transformCollectionResponseToPostmanRouteResponse(response));
    }
  });
  newRoutes.forEach((route) => {
    newRoutes.push(route);
  });
  return {
    newRoutes,
    responses,
  };
};

export const getUrlFromPostmanRequest = (item: CollectionRequest) => {
  const variables = getCollectionRequestUrlVariables(item);
  const queryString = getCollectionRequestUrlQueryString(item);
  const url =
    "/" +
    item.url.path
      .map((pathPart) => encodeURIComponent(variables.has(pathPart) ? variables.get(pathPart)! : pathPart))
      .join("/") +
    queryString;
  return url.substring(0, 750);
};

export const getCollectionRequestUrlVariables = (item: CollectionRequest): Map<string, string> => {
  const variableMap = new Map<string, string>();
  (item.url.variable ?? []).forEach((variable) => {
    variableMap.set(`:${variable.key}`, variable.value);
  });
  return variableMap;
};

export const getCollectionRequestUrlQueryString = (item: CollectionRequest): string => {
  let queryString = "";
  let index = 0;
  const queryStringMap = new Map<string, string>();
  (item.url.query ?? []).forEach((param, index) => {
    queryStringMap.set(param.key, param.value);
  });
  queryStringMap.forEach((value, key) => {
    queryString += `${index === 0 ? "?" : "&"}${key}=${encodeURIComponent(value)}`;
    index++;
  });
  return queryString;
};

export const transformCollectionRouteToPostmanRoute = (
  id: string,
  name: string,
  item: CollectionRequest,
): PostmanRoute => {
  const url = getUrlFromPostmanRequest(item);
  return {
    name: name,
    defaultUrl: url,
    method: item.method,
    responses: [] as Response[],
    postmanId: id,
  } as PostmanRoute;
};

export const transformCollectionResponseToPostmanRouteResponse = (item: CollectionRequestResponse): Response => {
  const headers = {} as any;
  (item.header ?? []).forEach((header) => {
    headers[header.key] = header.value;
  });
  let response = {};
  try {
    response = JSON.parse(item.body ?? "{}") ?? {};
  } catch (err) {
    response = {};
  }
  return {
    name: item.name ?? "New Response",
    statusCode: item.code ?? 200,
    response,
    headers,
    postmanId: item.id,
  } as Response;
};
