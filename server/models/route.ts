import { MockResponse } from "./response";

export type MockRoute = {
  id: string;
  name: string;
  defaultUrl: string;
  url?: string;
  method: string;
  currentExample?: MockResponse;
  responses: MockResponse[];
  postmanId?: string;
};
