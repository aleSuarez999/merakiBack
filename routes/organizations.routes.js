import express from "express"

import { getNetworksByOrg, getOrganizations } from "../controllers/organizationsController.js";

const route = express.Router()

route

    .get("/", getOrganizations)
    .get("/:orgId/networks/", getNetworksByOrg)
    


export default route;

