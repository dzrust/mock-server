export type MockResponse = {
  id: string;
  name: string;
  statusCode: number;
  response: any;
  headers: any;
  postmanId?: string;
};
