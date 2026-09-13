import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/avito";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
