import express from "express";

import { getEpisodeByLink, getRecentReleases } from "../scrapper/gogo";
import { getRedisClient } from "../utils/redis";

const router = express.Router();

router.get("/recent-releases", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:recent-releases:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }

    const p: number = parseInt((req.query.page as string) || "1");
    const data = await getRecentReleases(p);
    const response = {
      code: 200,
      message: "Success",
      data: data.animes,
      page: data.page,
    };
    if (!value) {
      res.json(response);
    }
    client.set(
      `fetchit:recent-releases:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/episode-detail", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:episode-detail:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }
    const link = (req.query.link as string) || "";
    const data = await getEpisodeByLink(link);
    const response = {
      code: 200,
      message: "Success",
      data,
    };
    if (!value) {
      res.json(response);
    }
    client.set(
      `fetchit:episode-detail:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

export default router;
