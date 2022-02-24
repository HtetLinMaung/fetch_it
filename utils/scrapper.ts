import puppeteer from "puppeteer";
import moment from "moment";

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

declare const document: any;

export const getJobNetJobs = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.jobnet.com.mm/mm/jobs-in-myanmar", {
    waitUntil: "networkidle2",
  });
  let jobs: any[] = [];

  const disabled: boolean = await page.evaluate(() => {
    const nextBtn = document.querySelector(".search__action-btn:last-child");
    return nextBtn.disabled;
  });

  let p = 1;
  do {
    const sub_jobs = await page.evaluate(() => {
      const sub_jobs: any[] = [];

      const job_titles = document.querySelectorAll(".search__job-heading");
      const detail_links = document.querySelectorAll(".search__job-heading a");
      const company_names = document.querySelectorAll(".search__job-subtitle");
      const locations = document.querySelectorAll(".search__job-location");
      const benefits = document.querySelectorAll("p.benefit");
      const highlights = document.querySelectorAll("p.highlights");
      const career_opportunities = document.querySelectorAll(
        ".search__job-list li:nth-child(3)"
      );
      const logos = document.querySelectorAll(".search__job-logo img");
      const days = document.querySelectorAll(".search__job-posted");
      const categories = document.querySelectorAll(".search__job-category");

      for (let i = 0; i < job_titles.length; i++) {
        sub_jobs.push({
          title_href: detail_links[i].href,
          job_title: job_titles[i].innerText,
          company_name: company_names[i].innerText,
          location: locations[i].innerText.replace(".", ""),
          benefits: benefits[i].innerText.replace("Benefits:", "").trim(),
          highlights: highlights[i].innerText.replace("Highlights:", "").trim(),
          career_opportunities: career_opportunities[i].innerText
            .replace("Career Opportunities:", "")
            .trim(),
          logo: logos[i].src,
          date: days[i].innerText.trim(),
          job_function: categories[i].innerText
            .replace("Job Function:", "")
            .trim(),
        });
        i++;
      }

      return sub_jobs;
    });
    jobs = [
      ...jobs,
      ...sub_jobs.map((job: any) => {
        job.date = job.date.replace("Today", moment().format("DD MMM YYYY"));
        return job;
      }),
    ];
    await page.click(".search__action-btn:last-child");
    await timeout(10000);
    console.log(`page ${p++}: `, sub_jobs.length);
  } while (!disabled);

  await browser.close();
  return jobs;
};
