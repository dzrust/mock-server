export type PostmanBulkInsertFailure = {
  postmanId: string;
  error: any;
};

export type PostmanBulkInsertResult = {
  createdRoutes: string[];
  updatedRoutes: string[];
  failedRoutes: PostmanBulkInsertFailure[];
  createdResponses: string[];
  updatedResponses: string[];
  failedResponses: PostmanBulkInsertFailure[];
};
