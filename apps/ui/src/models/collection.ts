export type PartialCollection = {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  uid: string;
  isPublic: boolean;
};

export type Collection = {
  info: {
    __postman_id: string;
    name: string;
    schema: string;
  };
  item: (CollectionFolder | CollectionTemplate)[];
  variable?: CollectionVariable[];
};

export type CollectionVariable = {
  id: string;
  key: string;
  value: string;
  type: string;
};

export type CollectionFolder = {
  name: string;
  id: string;
  item: (CollectionFolder | CollectionTemplate)[];
};

export type CollectionURL = {
  raw: string;
  host: string[];
  path: string[];
  variable?: { id: string; key: string; value: string; description: string }[];
  query?: { id: string; key: string; value: string; description: string }[];
};

export type CollectionRequest = {
  method: string;
  header: { key: string; value: string }[];
  body: any;
  url: CollectionURL;
  description: string;
};

export type CollectionTemplate = {
  name: string;
  id: string;
  request: CollectionRequest;
  response: CollectionRequestResponse[];
};

export type CollectionRequestResponse = {
  id: string;
  name: string;
  originalRequest: CollectionRequest;
  code?: number;
  header?: { key: string; value: string }[];
  body: string;
};
