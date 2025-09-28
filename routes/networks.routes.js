import express from "express"
import { getDevicesByNetwork } from "../controllers/networksController.js";
import { jwtAuth } from "../controllers/jwtAuth.js";

const route = express.Router()

route
  .get("/:networkId",jwtAuth, getDevicesByNetwork)


export default route;