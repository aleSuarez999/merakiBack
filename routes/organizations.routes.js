import express from "express"

import { getNetworksByOrg, getOrganizations, getStatusesOverview, getOrganizationApplianceUplinkStatuses } from "../controllers/organizationsController.js";
// import { apiKeyAuth } from "../middlewares/apiKeyAuth.js";
import { jwtAuth } from "../controllers/jwtAuth.js";

const route = express.Router()

route

    //.get("/", apiKeyAuth, getOrganizations )
    .get("/", jwtAuth, getOrganizations )
    .get("/:orgId/networks", jwtAuth, getNetworksByOrg)
    .get("/:orgId/devices/statuses/overview", jwtAuth, getStatusesOverview)
    .get("/:orgId/appliance/uplink/statuses", jwtAuth, getOrganizationApplianceUplinkStatuses)


    
    
export default route;

