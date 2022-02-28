import express from "express";
import { getCmMovies } from "../scrapper/cm";

const router = express.Router();

router.get("/movies", async (req, res) => {
  try {
    const p: number = parseInt((req.query.p as string) || "1");
    const movies = await getCmMovies(p);
    res.json({ code: 200, data: movies });
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

export default router;
