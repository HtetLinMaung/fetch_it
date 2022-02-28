import puppeteer from "puppeteer";

declare const document: any;

export const getCmMovies = async (p: number = 1) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    `https://channelmyanmar.org/movies${p > 1 ? "/page/" + p : ""}`,
    {
      waitUntil: "networkidle2",
    }
  );

  let movies: any[] = [];
  const sub_movies = await page.evaluate(() => {
    const sub_movies: any[] = [];
    const names = document.querySelectorAll(".fixyear h2");
    const images = document.querySelectorAll("div.item_1.items img");
    const hrefs = document.querySelectorAll("div.item_1.items a");

    for (let i = 0; i < names.length; i++) {
      sub_movies.push({
        name: names[i].innerText,
        image: images[i].src,
        href: hrefs[i].href,
      });
    }
    return sub_movies;
  });

  movies = [...movies, ...sub_movies];

  for (const movie of movies) {
    await page.goto(movie.href, { waitUntil: "networkidle2" });
    movie.date = await page.evaluate(() => {
      const date = document.querySelector("i[itemprop='datePublished']");
      if (!date) {
        return "";
      }
      return date.innerText;
    });
    movie.duration = await page.evaluate(() => {
      const duration = document.querySelector("i[itemprop='duration']");
      if (!duration) {
        return "";
      }
      return duration.innerText;
    });
    movie.genres = await page.evaluate(() => {
      const genre = document.querySelector("i.limpiar");
      if (!genre) {
        return [];
      }
      return genre.innerText.trim().split(", ");
    });
    // movie.download_link = await page.evaluate(() => {
    //   const anchors = document.querySelectorAll(".sbox .enlaces_box a");
    //   const servers = document.querySelectorAll(".sbox .enlaces_box a span.b");
    //   const links = [];
    //   let i = 0;
    //   for (const anchor of anchors) {
    //     if (anchor) {
    //       links.push({ link: anchor.href, server: servers[i].innerText });
    //     }
    //     i++;
    //   }
    //   return links;
    // });
  }

  await browser.close();
  return movies;
};
