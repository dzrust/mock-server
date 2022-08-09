import Realm from "realm";
import { ResponseSchema } from "../schemas/response";
import { RouteSchema } from "../schemas/route";

let realm: Realm;

export const loadRealm = async (onSuccess: Function, onFailure: Function) => {
  try {
    realm = await Realm.open({
      path: "mockserver-realm",
      schema: [RouteSchema, ResponseSchema],
    });
    onSuccess();
  } catch (err) {
    onFailure(err);
  }
};

export const closeRealm = () => {
  if (realm && !realm.isClosed) {
    realm.close();
  }
};

export const getRealm = () => {
  if (!realm) {
    throw "You must open the realm before using it";
  }
  if (realm.isClosed) {
    throw "The realm has been closed";
  }

  return realm;
};
