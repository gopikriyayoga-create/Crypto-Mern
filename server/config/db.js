import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    // ✅ Validate env
    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Optional: debug (safe version)
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(uri, {
      dbName: "authDB", // ensures correct DB
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
