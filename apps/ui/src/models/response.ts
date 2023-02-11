import * as yup from "yup";

export type Response = {
  id: number;
  name: string;
  statusCode: number;
  response: any;
  headers: any;
  routeId: number;
  postmanId?: string;
};

export const responseFormModel = yup.object().shape({
  name: yup.string().required(),
  statusCode: yup.number().required(),
  response: yup.mixed().required(),
  headers: yup.mixed().required(),
});

export interface ResponseFormModelType extends yup.InferType<typeof responseFormModel> {}
