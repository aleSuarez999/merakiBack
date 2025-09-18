import express from "express"
import { getDevicesByNetwork } from "../controllers/networksController.js";

const route = express.Router()

route
  .get("/:networkId", getDevicesByNetwork)


export default route;