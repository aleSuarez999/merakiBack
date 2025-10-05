import express from "express"
import { getDevicesByNetwork, getNetwork } from "../controllers/networksController.js";
import { jwtAuth } from "../controllers/jwtAuth.js";

const route = express.Router()

route
  .get("/:networkId",jwtAuth,  getNetwork)
  .get("/:networkId/devices",jwtAuth, getDevicesByNetwork)



export default route;