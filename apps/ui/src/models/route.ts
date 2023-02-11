import * as yup from "yup";
import { Response } from "./response";

export type Route = {
  id: number;
  name: string;
  defaultUrl: string;
  url?: string;
  method: string;
  currentExample?: Response;
  postmanId?: string;
};

export const routeFormModel = yup.object().shape({
  name: yup.string().required(),
  url: yup.string(),
  method: yup.string().required(),
});

export interface RouteFormModelType extends yup.InferType<typeof routeFormModel> {}
