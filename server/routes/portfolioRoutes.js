import express from "express";
import {
  getPortfolio,
  addInvestment,
  updateInvestment,
  deleteInvestment,
} from "../controllers/portfolioController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getPortfolio)
  .post(protect, addInvestment);

router.route("/:id")
  .put(protect, updateInvestment)
  .delete(protect, deleteInvestment);

export default router;
