import express from "express"
import { getClientByDevices } from "../controllers/devicesController.js";
import { jwtAuth } from "../controllers/jwtAuth.js";


const route = express.Router()

route
  .get("/:serial/",jwtAuth, getClientByDevices)


export default route;