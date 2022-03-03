import axios from "axios";
import * as cheerio from "cheerio";

export const getRecentReleases = async (p: number = 1) => {
  const { data } = await axios.get(
    `https://ww2.gogoanimes.org/ajax/page-recent-release?page=${p}&type=1`
  );
  const $ = cheerio.load(data);
  const anchors: any[] = [];
  $("ul.items p.name a").each(function (i, el) {
    anchors[i] = {
      link: el.attribs.href,
      name: $(this).text().trim(),
    };
  });
  const images: string[] = [];
  $("ul.items img").each(function (i, el) {
    images[i] = el.attribs.src;
  });
  const episodes: string[] = [];
  $("ul.items p.episode").each(function (i, el) {
    episodes[i] = $(this).text().trim();
  });
  const recent_releases = [];
  let i = 0;
  for (const anchor of anchors) {
    recent_releases.push({
      ...anchor,
      img: images[i],
      latest_episode: episodes[i],
    });
    i++;
  }
  return { recent_releases, page: p };
};

export const getEpisodeByLink = async (link: string) => {
  const { data } = await axios.get(link);
  const $ = cheerio.load(data);
  const stream = $("#load_anime iframe").attr("src");
  const title = $(".anime_video_body h1").text();

  const related_episodes = [];
  const linkArr = link.split("-");
  const final_ep = parseInt(linkArr[linkArr.length - 1]);
  linkArr.pop();
  const l = linkArr.join("-");
  for (let j = final_ep; j > 0; j--) {
    related_episodes.push({ link: `${l}-${j}`, name: `EP ${j}` });
  }

  return { related_episodes, stream, title };
};
