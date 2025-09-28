import express from "express";
import { getClientsSummary } from "../controllers/summaryController.js";
import { jwtAuth } from "../controllers/jwtAuth.js";

const route = express.Router();

route.get("/clientsByAp", jwtAuth, getClientsSummary);

export default route;
