import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.js";
import Portfolio from "../models/portfolio.js";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const coinIds = [
  "bitcoin", "ethereum", "tether", "binancecoin", "solana", 
  "ripple", "usd-coin", "steth", "cardano", "avalanche-2", 
  "dogecoin", "polkadot", "tron", "chainlink", "matic-network"
];

const seedUsers = async () => {
  try {
    console.log("Clearing existing User and Portfolio data...");
    await User.deleteMany({});
    await Portfolio.deleteMany({});

    console.log("Generating 100 mock users...");
    const users = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    for (let i = 1; i <= 100; i++) {
      users.push({
        name: `Test User ${i}`,
        email: `testuser${i}@example.com`,
        password: hashedPassword,
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created.`);

    console.log("Generating mock portfolios...");
    const portfolios = [];

    createdUsers.forEach((user) => {
      const numCoins = Math.floor(Math.random() * 5) + 1; // 1 to 5 coins
      const shuffledCoins = [...coinIds].sort(() => 0.5 - Math.random());
      const selectedCoins = shuffledCoins.slice(0, numCoins);

      selectedCoins.forEach((coinId) => {
        portfolios.push({
          user: user._id,
          coinId: coinId,
          quantity: parseFloat((Math.random() * 10).toFixed(4)) + 0.01,
          purchasePrice: parseFloat((Math.random() * 50000).toFixed(2)) + 1,
        });
      });
    });

    const createdPortfolios = await Portfolio.insertMany(portfolios);
    console.log(`${createdPortfolios.length} portfolio records created.`);
    
    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
