import { NextFunction, Request, Response, json, urlencoded } from "express";
import express from "express";
import dotenv from "dotenv";

import cors from "cors";
import user_router from "./routes/userRoutes";


dotenv.config();
const port = process.env.PORT;

const app = express();
app.use(json());
app.use(cors());
app.use(urlencoded({ extended: true }));

app.use("/user", user_router);


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.json({
    error: err.message,
  });
});

app.listen(port, () => {
  console.log(`Xplora Tours is running on port ${port}`);
});
