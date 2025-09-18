import express from "express"
import { getClientByDevices } from "../controllers/devicesController.js";


const route = express.Router()

route
  .get("/:serial/", getClientByDevices)


export default route;