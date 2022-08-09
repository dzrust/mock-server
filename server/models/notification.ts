import { v4 } from "uuid";

export enum NOTIFICATION_TYPE {
  ERROR,
  INFO,
}

export type Notification = { id: string; message: string; type: NOTIFICATION_TYPE };

export const createError = (message: string): Notification => ({
  id: v4(),
  message,
  type: NOTIFICATION_TYPE.ERROR,
});
