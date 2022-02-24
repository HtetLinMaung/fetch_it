import dotenv from "dotenv";
import cors from "cors";
import express from "express";

import jobRoute from "./routes/job-route";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/mmjobs/jobs", jobRoute);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
