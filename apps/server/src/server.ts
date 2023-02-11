import express from "express";
import cors from "cors";
import { loadRoutesFromDB } from "./load-routes";
import { loadStaticRoutes } from "./static-routes";

export const startServer = () => {
  console.log("loaded database continuining to bind server");
  const app = express();
  app.use(cors());
  // parse requests of content-type - application/json
  app.use(express.json({ limit: "100mb" }));
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));
  // simple route

  // set port, listen for requests
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });

  loadRoutesFromDB(app);

  loadStaticRoutes(app);
};
