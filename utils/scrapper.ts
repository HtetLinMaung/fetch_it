import puppeteer from "puppeteer";

declare const document: any;

export const getJobNetJobs = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.jobnet.com.mm/mm/jobs-in-myanmar", {
    waitUntil: "networkidle2",
  });
  await page.evaluate(() => {
    const job_items = document.querySelectorAll(".serp-item");
    console.log(job_items);
  });
  await browser.close();
  return [];
};
