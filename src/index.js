import "dotenv/config";
import { connectDB } from "../config/database.js";

connectDB();

console.log(connectDB);