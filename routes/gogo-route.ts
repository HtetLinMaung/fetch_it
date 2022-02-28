import express from "express";

import { getEpisodeByLink, getRecentReleases } from "../scrapper/gogo";

const router = express.Router();

router.get("/recent-releases", async (req, res) => {
  try {
    const p: number = parseInt((req.query.page as string) || "1");
    const data = await getRecentReleases(p);
    res.json({
      code: 200,
      message: "Success",
      data: data.animes,
      page: data.page,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/episode-detail", async (req, res) => {
  try {
    const link = (req.query.link as string) || "";
    const data = await getEpisodeByLink(link);
    res.json({
      code: 200,
      message: "Success",
      data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

export default router;
