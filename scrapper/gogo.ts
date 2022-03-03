import axios from "axios";
import * as cheerio from "cheerio";

const host = "https://ww2.gogoanimes.org";

export const getAnimes = async (m: string, p: number = 1) => {
  const { data } = await axios.get(`${host}/${m}?page=${p}`);
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
  const animes = [];
  let i = 0;
  for (const anchor of anchors) {
    animes.push({
      ...anchor,
      img: images[i],
      release: episodes[i],
    });
    i++;
  }
  return { animes, page: p };
};

export const getAnimeInfo = async (c: string) => {
  const { data } = await axios.get(`${host}/${c}`);
  let $ = cheerio.load(data);
  const img = $(".anime_info_body_bg img").attr("src");
  const name = $(".anime_info_body_bg h1").text().trim();

  const infos: any = {};
  $(".anime_info_body_bg p").each(function (i, el) {
    const [k, v] = $(this).text().trim().split(":");
    if (k.toLowerCase() == "genre") {
      infos[k] = v.split(",").map((x) => x.trim());
    } else {
      infos[k] = v.replaceAll("\n", "").replaceAll("\t", "").trim();
    }
  });

  const eps: any[] = [];
  $("#episode_page li a").each(function (i, el) {
    eps.unshift({
      ep_start: $(this).attr("ep_start"),
      ep_end: $(this).attr("ep_end") || $(this).attr("ep_start"),
    });
  });

  return { img, name, ...infos, eps };
};

export const getRecentReleases = async (p: number = 1) => {
  const { data } = await axios.get(
    `${host}/ajax/page-recent-release?page=${p}&type=1`
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

export const getRelatedEpisodes = async (c: string, eps: any[] = []) => {
  let alias = c;
  if (c.includes("-episode")) {
    alias = `/category/${c.split("/").pop()?.split("-episode")[0]}`;
  }
  const related_episodes: any = [];
  for (const ep of eps) {
    const epres = await axios.get(
      `${host}/ajaxajax/load-list-episode?ep_start=${ep.ep_start}&ep_end=${ep.ep_end}&id=0&default_ep=&alias=${alias}`
    );
    const $ = cheerio.load(epres.data);
    $("#episode_related a").each(function (i, el) {
      related_episodes.push({
        link: el.attribs.href,
        name: `EP ${el.attribs.href.split("-").pop()}`,
      });
    });
  }
  return related_episodes;
};

export const getEpisodeByLink = async (link: string) => {
  const { data } = await axios.get(link);
  let $ = cheerio.load(data);
  const stream = $("#load_anime iframe").attr("src");
  const title = $(".anime_video_body h1").text();

  const eps: any[] = [];
  $("#episode_page li a").each(function (i, el) {
    eps.unshift({
      ep_start: $(this).attr("ep_start"),
      ep_end: $(this).attr("ep_end") || $(this).attr("ep_start"),
    });
  });

  return { stream, title, eps };
};

export const searchAnimes = async (keyword: string, p: number = 1) => {
  const { data } = await axios.get(
    `${host}/search?keyword=${keyword}&page=${p}`
  );
  const $ = cheerio.load(data);
  const anchors: any[] = [];
  $("ul.items p.name a").each(function (i, el) {
    anchors[i] = {
      link: `${host}/watch/${el.attribs.href.split("/").pop()}-episode-1`,
      name: $(this).text().trim(),
    };
  });
  const images: string[] = [];
  $("ul.items img").each(function (i, el) {
    images[i] = el.attribs.src;
  });
  const releases: string[] = [];
  $("ul.items p.released").each(function (i, el) {
    releases[i] = $(this).text().trim();
  });
  const results = [];
  let i = 0;
  for (const anchor of anchors) {
    results.push({
      ...anchor,
      img: images[i],
      release: releases[i],
    });
    i++;
  }
  return { results, page: p };
};
