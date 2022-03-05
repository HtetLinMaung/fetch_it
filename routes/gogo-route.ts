import express from "express";

import {
  getAnimeInfo,
  getAnimes,
  getAnimesByGenre,
  getAnimesBySubCategory,
  getCompletedAnimes,
  getEpisodeByLink,
  getOngoingAnimes,
  getRecentReleases,
  getRelatedEpisodes,
  searchAnimes,
} from "../scrapper/gogo";
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
      data: data.recent_releases,
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

router.get("/type/:m", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:type:${req.params.m}:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }

    const p: number = parseInt((req.query.page as string) || "1");
    const m = req.params.m as string;
    const data = await getAnimes(m, p);
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
      `fetchit:type:${req.params.m}:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/genre/:genre", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:genre:${req.params.genre}:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }

    const p: number = parseInt((req.query.page as string) || "1");
    const genre = req.params.genre as string;
    const data = await getAnimesByGenre(genre, p);
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
      `fetchit:genre:${req.params.genre}:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/sub-category/:sub", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:sub-category:${req.params.sub}:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }

    const p: number = parseInt((req.query.page as string) || "1");
    const sub = req.params.sub as string;
    const data = await getAnimesBySubCategory(sub, p);
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
      `fetchit:sub-category:${req.params.sub}:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/ongoing", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:ongoing:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }

    const p: number = parseInt((req.query.page as string) || "1");

    const data = await getOngoingAnimes(p);
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
      `fetchit:ongoing:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/completed", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:completed:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }

    const p: number = parseInt((req.query.page as string) || "1");

    const data = await getCompletedAnimes(p);
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
      `fetchit:completed:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:search:${JSON.stringify(req.query)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }

    const p: number = parseInt((req.query.page as string) || "1");
    const keyword = req.query.keyword as string;
    const data = await searchAnimes(keyword, p);
    const response = {
      code: 200,
      message: "Success",
      data: data.results,
      page: data.page,
    };
    if (!value) {
      res.json(response);
    }
    client.set(
      `fetchit:search:${JSON.stringify(req.query)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

router.get("/info", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(`fetchit:info:${JSON.stringify(req.query)}`);
    if (value) {
      res.json(JSON.parse(value));
    }
    const c = (req.query.c as string) || "";
    const data = await getAnimeInfo(c);
    const response = {
      code: 200,
      message: "Success",
      data,
    };
    if (!value) {
      res.json(response);
    }
    client.set(
      `fetchit:info:${JSON.stringify(req.query)}`,
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

router.post("/related-episodes", async (req, res) => {
  try {
    const client = await getRedisClient();
    const value = await client.get(
      `fetchit:related-episodes:${JSON.stringify(req.body)}`
    );
    if (value) {
      res.json(JSON.parse(value));
    }
    const data = await getRelatedEpisodes(req.body.c, req.body.eps);
    const response = {
      code: 200,
      message: "Success",
      data,
    };

    if (!value) {
      res.json(response);
    }
    client.set(
      `fetchit:related-episodes:${JSON.stringify(req.body)}`,
      JSON.stringify(response)
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

export default router;
