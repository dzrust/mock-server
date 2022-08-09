import { loadRealm } from "./models/database";
import { startServer } from "./server";

loadRealm(startServer, (err: any) => console.error("Failed to load database aborting", err));
