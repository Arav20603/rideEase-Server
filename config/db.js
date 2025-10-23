import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    })
    console.log(conn.connection.host)
  } catch (error) {
    console.log(`Error in connecting to database: ${error}`)
    process.exit(1)
  }
}