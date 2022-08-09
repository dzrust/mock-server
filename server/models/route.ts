import { MockResponse } from "./response";

export type MockRoute = {
  name: string;
  defaultUrl: string;
  url?: string;
  method: string;
  curentExample?: MockResponse;
  responses: MockResponse[];
  postmanId?: string;
};
