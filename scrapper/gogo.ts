import puppeteer from "puppeteer";
import timeout from "../utils/timeout";

declare const document: any;

export const getRecentReleases = async (p: number = 1) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(`https://ww2.gogoanimes.org/`, {
    waitUntil: "networkidle2",
  });

  if (p > 1 && p <= 5) {
    await page.click(`.recent .pagination-list a[data-page='${p}']`);
    await timeout(1000);
  } else if (p > 5) {
    let j = 5;
    while (j < p) {
      await page.click(`.recent .pagination-list a[data-page='${j}']`);
      await timeout(1000);
      j = j + 2;
    }
    await page.click(`.recent .pagination-list a[data-page='${p}']`);
    await timeout(1000);
  }

  const recent_releases: any = await page.evaluate(() => {
    const p = document.querySelector(
      `.recent .pagination-list li.selected`
    ).innerText;
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
    return { animes, page: p };
  });

  await browser.close();
  return recent_releases;
};

export const getEpisodeByLink = async (link: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(link, { waitUntil: "networkidle2" });

  const stream = await page.evaluate(() => {
    return document.querySelector("#load_anime iframe").src;
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
  return { related_episodes, stream };
};
