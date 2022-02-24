import express from "express";
import puppeteer from "puppeteer";
import { getJobNetJobs } from "../utils/scrapper";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const jobs = await getJobNetJobs();
    res.json(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

export default router;
