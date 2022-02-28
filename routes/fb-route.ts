import express from "express";
import { getFbData } from "../scrapper/fb";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await getFbData();
    res.json({ code: 200, data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Server Error!" });
  }
});

export default router;
