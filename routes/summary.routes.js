import express from "express";
import { getClientsSummary } from "../controllers/summaryController.js";

const route = express.Router();

route.get("/clientsByAp", getClientsSummary);

export default route;
