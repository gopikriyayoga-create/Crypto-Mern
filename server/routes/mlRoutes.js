import express from "express";
import { predictTrend } from "../controllers/mlController.js";

const router = express.Router();

router.get("/predict/:coin", predictTrend);

export default router;
