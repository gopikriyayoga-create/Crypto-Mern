import Portfolio from "../models/portfolio.js";

// @desc    Get user portfolio
// @route   GET /api/portfolio
// @access  Private
export const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add investment
// @route   POST /api/portfolio
// @access  Private
export const addInvestment = async (req, res) => {
  try {
    const { coinId, quantity, purchasePrice, date } = req.body;

    if (!coinId || !quantity || !purchasePrice) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const newInvestment = await Portfolio.create({
      user: req.user._id,
      coinId,
      quantity,
      purchasePrice,
      date: date ? new Date(date) : undefined
    });

    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update investment
// @route   PUT /api/portfolio/:id
// @access  Private
export const updateInvestment = async (req, res) => {
  try {
    const investment = await Portfolio.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    // Check if user owns this investment
    if (investment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized to update this investment" });
    }

    const updatedInvestment = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedInvestment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete investment
// @route   DELETE /api/portfolio/:id
// @access  Private
export const deleteInvestment = async (req, res) => {
  try {
    const investment = await Portfolio.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    // Check if user owns this investment
    if (investment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized to delete this investment" });
    }

    await Portfolio.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: "Investment removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
