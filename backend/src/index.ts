import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./route/auth";
import todoRoutes from "./route/todos";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Todo API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
