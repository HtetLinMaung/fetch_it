import puppeteer from "puppeteer";

declare const document: any;

export const getFbData = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`https://www.facebook.com/`, {
    waitUntil: "networkidle2",
  });
  await page.type("input[name='email']", "");
  await page.type("input[name='pass']", "");
  await page.click("button[name='login']");

  return [];
};
