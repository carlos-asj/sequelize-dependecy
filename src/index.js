import "dotenv/config";
import { connectDB } from "../config/database.js";
import "dotenv/config";
import express from "express";
import router from "../src/view/routes.js";

const port = 3000;
const app = express();

app.use(express.json()); // configura o backend pra receber json * sempre antes das rotas
app.use(router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

connectDB();