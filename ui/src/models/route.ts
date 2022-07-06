import * as yup from "yup";

export type Route = {
  id: number;
  name: string;
  defaultUrl: string;
  url?: string;
  method: string;
  currentExampleId?: number;
  postmanId?: string;
};

export const routeFormModel = yup.object().shape({
  name: yup.string().required(),
  url: yup.string().required(),
  method: yup.string().required(),
});

export interface RouteFormModelType extends yup.InferType<typeof routeFormModel> {}
