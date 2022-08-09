import { CustomError } from "./models/Error";
import { Response, Request } from "express";

export const sendError = (_: Request, res: Response, error: any, errorObject: CustomError) => {
  console.error(error);
  res.status(500).json(errorObject);
};
