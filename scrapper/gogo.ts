import puppeteer from "puppeteer";
import timeout from "../utils/timeout";

declare const document: any;

export const getRecentReleases = async (p: number = 1) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  await page.goto(
    `https://ww2.gogoanimes.org/ajax/page-recent-release?page=${p}&type=1`
  );

  const recent_releases: any = await page.evaluate(() => {
    const anchors = document.querySelectorAll("ul.items p.name a");
    const images = document.querySelectorAll("ul.items img");
    const episodes = document.querySelectorAll("ul.items p.episode");
    const animes = [];
    let i = 0;
    for (const anchor of anchors) {
      animes.push({
        link: anchor.href,
        name: anchor.innerText.trim(),
        img: images[i].src,
        latest_episode: episodes[i].innerText.trim(),
      });
      i++;
    }
    return animes;
  });

  await browser.close();
  return { recent_releases, page: p };
};

export const getEpisodeByLink = async (link: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.on("console", (msg) => console.log(msg.text()));
  page.on("pageerror", (msg) => console.log(msg));
  await page.setDefaultNavigationTimeout(0);
  await page.goto(link, { timeout: 0 });
  await page.screenshot({ path: "screenshot1.png" });
  await page.waitForSelector("#load_anime iframe", { timeout: 0 });
  await page.screenshot({ path: "screenshot2.png" });
  const stream = await page.evaluate(() => {
    return document.querySelector("#load_anime iframe").src;
  });
  const title = await page.evaluate(() => {
    return document.querySelector(".anime_video_body h1").innerText;
  });

  const related_episodes = [];
  const linkArr = link.split("-");
  const final_ep = parseInt(linkArr[linkArr.length - 1]);
  linkArr.pop();
  const l = linkArr.join("-");
  for (let j = final_ep; j > 0; j--) {
    related_episodes.push({ link: `${l}-${j}`, name: `EP ${j}` });
  }

  await browser.close();
  return { related_episodes, stream, title };
};
