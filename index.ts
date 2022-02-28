import dotenv from "dotenv";
import cors from "cors";
import express from "express";

dotenv.config();

import jobRoute from "./routes/job-route";
import cmRoute from "./routes/cm-route";
import fbRoute from "./routes/fb-route";
import ggAnime from "./routes/gogo-route";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/fetchit/jobnet/jobs", jobRoute);
app.use("/fetchit/cm", cmRoute);
app.use("/fetchit/fb", fbRoute);
app.use("/fetchit/gganime", ggAnime);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
