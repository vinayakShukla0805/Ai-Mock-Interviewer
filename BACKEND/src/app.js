import express from "express";
import cors from "cors";
import userRoutes from "./routes/authRoutes.js"

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/user",userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "AI Mock Interviewer API is running",
  });
});

export default app;
