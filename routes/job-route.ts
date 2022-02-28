import express from "express";
import { getRedisClient } from "../utils/redis";
import { getJobNetJobs } from "../scrapper/jobnet";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const kw: string = (req.query.kw as string) || "";
    const n = parseInt((req.query.n as string) || "1");

    const client = await getRedisClient();
    const value = await client.get(`fetchit:jobs:${JSON.stringify(req.query)}`);

    if (value) {
      res.json(JSON.parse(value));
    }

    const jobs = await getJobNetJobs(n, kw);
    const response = { code: 200, data: jobs };
    if (!value) {
      res.json(response);
    }
    client.set(
      `fetchit:jobs:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

export default router;
