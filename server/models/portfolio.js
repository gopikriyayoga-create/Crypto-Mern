import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coinId: {
      type: String,
      required: [true, "Please add a coin ID (e.g., 'bitcoin')"],
    },
    quantity: {
      type: Number,
      required: [true, "Please add a quantity"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Please add a purchase price per coin (in USD)"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
