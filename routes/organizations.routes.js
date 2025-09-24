import express from "express"

import { getNetworksByOrg, getOrganizations, getStatusesOverview } from "../controllers/organizationsController.js";

const route = express.Router()

route

    .get("/", getOrganizations)
    .get("/:orgId/networks/", getNetworksByOrg)
    .get("/:orgId/devices/statuses/overview", getStatusesOverview)
    
export default route;

