import { MockResponse } from "./response";

export enum METHOD {
  CONNECT = "CONNECT",
  DELETE = "DELETE",
  GET = "GET",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  POST = "POST",
  PUT = "PUT",
  TRACE = "TRACE",
}

export type MockRoute = {
  id: string;
  name: string;
  defaultUrl: string;
  url?: string;
  method: METHOD | string;
  currentExample?: MockResponse;
  responses: MockResponse[];
  postmanId?: string;
};
