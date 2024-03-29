import axios from "axios";
import * as cheerio from "cheerio";

const host = "https://gogoanime.fi";
const ajax = "https://ajax.gogo-load.com";
// const host = "https://ww4.gogoanimes.org";
// const ajax = "https://ww4.gogoanimes.org";

export const getAnimes = async (m: string, p: number = 1) => {
  return getAnimesByUrl(`${m}${host.includes("fi") ? ".html" : ""}`, {
    page: p,
  });
};

export const getAnimeInfo = async (c: string) => {
  const { data } = await axios.get(`${host}/${c}`);
  let $ = cheerio.load(data);
  const img = $(".anime_info_body_bg img").attr("src");
  const name = $(".anime_info_body_bg h1").text().trim();

  const infos: any = {};
  $(".anime_info_body_bg p").each(function (i, el) {
    const [k, v] = $(this).text().trim().split(":");
    if (k != "Click to manage book marks") {
      if (k.toLowerCase() == "genre") {
        infos[k] = v.split(",").map((x) => x.trim());
      } else {
        infos[k] = v ? v.replaceAll("\n", "").replaceAll("\t", "").trim() : "";
      }
    }
  });

  const eps: any[] = [];
  $("#episode_page li a").each(function (i, el) {
    let movie_id = "";
    let default_ep = "";
    let alias = "";
    if (host.includes(".fi")) {
      movie_id = $("#movie_id").attr("value") || "";
      default_ep = $("#default_ep").attr("value") || "";
      alias = $("#alias_anime").attr("value") || "";
    }
    eps.unshift({
      ep_start: $(this).attr("ep_start"),
      ep_end: $(this).attr("ep_end") || $(this).attr("ep_start"),
      movie_id,
      default_ep,
      alias,
    });
  });

  return { img, name, ...infos, eps };
};

export const getRecentReleases = async (p: number = 1) => {
  let data = null;
  if (host.includes(".fi")) {
    const res = await axios.get(
      `${ajax}/ajax/page-recent-release.html?page=${p}&type=1`
    );
    data = res.data;
  } else {
    const res = await axios.get(
      `${host}/ajax/page-recent-release?page=${p}&type=1`
    );
    data = res.data;
  }

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
      `${host.includes(".fi") ? ajax : host}/ajax${
        host.includes("https://ww4.gogoanimes.org") ? "ajax" : ""
      }/load-list-episode?ep_start=${ep.ep_start}&ep_end=${ep.ep_end}&id=${
        ep.movie_id || "0"
      }&default_ep=${ep.default_ep || ""}&alias=${
        host.includes(".fi") ? ep.alias : alias
      }`
    );
    const $ = cheerio.load(epres.data);
    $("#episode_related a").each(function (i, el) {
      // const episode = el.attribs.href.includes("-episode")
      //   ? el.attribs.href.split("-").pop()
      //   : "0";
      let episode = "0";
      if (el.attribs.href.includes("-episode")) {
        const pattern = /^.*-\d{1,10}-\d{1,10}$/;
        if (pattern.test(el.attribs.href)) {
          const splitHref = el.attribs.href.split("-");
          episode = splitHref[splitHref.length - 2];
        } else {
          episode = el.attribs.href.split("-").pop() as string;
        }
      }
      related_episodes.push({
        link: el.attribs.href,
        name: `EP ${episode}`,
        episode,
      });
    });
  }
  return related_episodes;
};

export const getEpisodeByLink = async (link: string) => {
  const { data } = await axios.get(
    host.includes("https://ww4.gogoanimes.org")
      ? `${host}/watch/${link}`
      : `${host}/${link}`
  );
  let $ = cheerio.load(data);
  let stream = $("#load_anime iframe").attr("src");

  const title = $(".anime_video_body h1")
    .text()
    .replace("English Subbed at gogoanime", "");
  const category = $(".anime-info a").attr("href");
  const anime_name = $(".anime-info a").text();

  const eps: any[] = [];
  $("#episode_page li a").each(function (i, el) {
    let movie_id = "";
    let default_ep = "";
    let alias = "";
    if (host.includes(".fi")) {
      movie_id = $("#movie_id").attr("value") || "";
      default_ep = $("#default_ep").attr("value") || "";
      alias = $("#alias_anime").attr("value") || "";
    }
    eps.unshift({
      ep_start: $(this).attr("ep_start"),
      ep_end: $(this).attr("ep_end") || $(this).attr("ep_start"),
      movie_id,
      default_ep,
      alias,
    });
  });

  let current_episode = "";
  const titlearr = title.split("Episode");
  if (titlearr.length > 1) {
    current_episode = titlearr[1].trim().replaceAll(/[a-zA-Z]/g, "");
  }

  return { stream, title, eps, current_episode, category, anime_name };
};

export const searchAnimeInfos = async (keyword: string) => {
  try {
    const { data } = await axios.get(
      `${ajax}/${
        host.includes("https://ww4.gogoanimes.org") ? "ajax" : ""
      }site/loadAjaxSearch`,
      {
        params: {
          keyword,
          id: "-1",
          link_web: host,
        },
      }
    );
    const $ = cheerio.load(data.content);

    const images: string[] = [];
    $("a.ss-title .thumbnail-recent_search").each(function (i, el) {
      const style = $(this).attr("style") as string;
      images.push(
        style
          .trim()
          .replace("background: url(", "")
          .replace(")", "")
          .replace(/\"/g, "")
      );
    });

    const results: any[] = [];
    $("a.ss-title").each(function (i, el) {
      results.push({
        category: el.attribs.href.replace(host, "/"),
        name: $(this).text(),
        img: images[i],
      });
    });
    return results;
  } catch (err) {
    return [];
  }
};

export const searchAnimes = async (keyword: string, p: number = 1) => {
  try {
    const { data } = await axios.get(
      `${host}/search${
        host.includes(".fi") ? ".html" : ""
      }?keyword=${keyword}&page=${p}`
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
  } catch (err) {
    return { results: [], page: p };
  }
};

export const getAnimesByGenre = async (genre: string, p: number = 1) => {
  return getAnimesByUrl(`genre/${genre}`, { page: p });
};

export const getAnimesBySubCategory = async (
  subCategory: string,
  p: number = 1
) => {
  return getAnimesByUrl(`sub-category/${subCategory}`, { page: p });
};

export const getOngoingAnimes = async (p: number = 1) => {
  return getAnimesByUrl(`ongoing-anime${host.includes(".fi") ? ".html" : ""}`, {
    page: p,
  });
};

export const getCompletedAnimes = async (p: number = 1) => {
  return getAnimesByUrl(
    `completed-anime${host.includes(".fi") ? ".html" : ""}`,
    {
      page: p,
    }
  );
};

export const getAnimesByUrl = async (url: string, params = { page: 1 }) => {
  const { data } = await axios.get(`${host}/${url}`, {
    params,
  });
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
  return { animes, page: params.page };
};
