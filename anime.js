const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const filePath = "./anime.json";

// Sleep function called in order not to risk being banned
const sleep = (ms) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

async function getAnimeSeason(hostname, animeURL) {
  console.log(`${hostname}/${animeURL}/`);

  try {
    const allSeasons = [];
    const result = await axios.get(`${hostname}${animeURL}/`);
    const $ = cheerio.load(result.data);

    const animeName = $("body > div.Singamda").text();
    const animeDesc = $("div.Box").text();
    const animeImg = `${hostname}/${$("body > div.Box > b > img").attr("src")}`;

    const seasons = $(".Singamdasam > a")
      .map((index, element) => {
        const seasonNum = $(element).text();
        const url = $(element).attr("href");

        return { seasonNum, url };
      })
      .get();

    allSeasons.push(...seasons);

    return {
      animeName: animeName,
      animeDesc: animeDesc,
      animeImg: animeImg,
      seasons: allSeasons.slice(0, -2),
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "Check the link, It is not correct",
        error: error.message,
      })
    );
    return JSON.stringify({
      message: "Check the link, It is not correct",
    });
  }
}

async function getEpisoleInSeason(anime) {
  const seasonsWithEpisole = [];
  for (season of anime.seasons) {
    try {
      const result = await axios.get(`https:${season.url}`);
      console.log("Request Fired: " + season.seasonNum);
      const $ = cheerio.load(result.data);

      await sleep(3000);
      season.episoles = $(".Singamdasam > a")
        .map((index, element) => {
          episoleNum = $(element).text();

          episole_url = $(element).attr("href");

          if (episoleNum == "Home") return;

          if (episoleNum == "Back") return;

          return { episoleNum, episole_url };
        })
        .get();
      seasonsWithEpisole.push(season);
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "Check the link, It is not correct",
          error: error.message,
        })
      );
      return JSON.stringify({
        message: "Check the link, It is not correct",
      });
    }
  }

  return seasonsWithEpisole;
}

async function getVideoDetails(seasonsWithEpisole, anime) {
  const seasons = [];
  for (const season of seasonsWithEpisole) {
    const episoles = [];
    for (const episole of season.episoles) {
      try {
        const result = await axios.get(`https:${episole.episole_url}`);
        const $ = cheerio.load(result.data);

        const video_detail_url = $(
          "body > div.Box > div > table > tbody > tr > td > span > a"
        ).attr("href");

        const video_detail_result = await axios.get(
          `https:${video_detail_url}`
        );
        const S = cheerio.load(video_detail_result.data);
        await sleep(1000);

        episole.filename = S("tr:nth-child(1) > td.desc_value").text();
        episole.filesize = S("tr:nth-child(2) > td.desc_value").text();
        episole.duration = S("tr:nth-child(3) > td.desc_value").text();
        episole.video_url = `https://eng.cartoonsarea.cc${S(
          "a.download-btn"
        ).attr("href")}`;

        console.log("Request Fired: " + episole.filename + " gotten!");
        episoles.push(episole);
      } catch (error) {
        console.error(
          JSON.stringify({
            message: "Check the link, It is not correct",
            error: error.message,
          })
        );
        return JSON.stringify({
          message: "Check the link, It is not correct",
        });
      }
    }
    seasons.push(season);
  }

  animeObj = {
    animeTitle: anime.animeName,
    animeDetails: anime.animeDesc,
    animeImg: anime.animeImg,

    seasons: seasons,
  };
  return animeObj;
}

module.exports = async function main(url) {
  console.log(url);

  const urlArray = url.split("/").slice(2, 6);
  const urlLength = url.split("/").length;
  console.log(urlArray);

  if (urlArray[0] !== "eng.cartoonsarea.cc") {
    console.log("Na here urlArray I hook");

    return JSON.stringify({
      message: "Check the link, It is not correct",
    });
  }

  if (urlLength <= 6) {
    console.log(urlLength);

    console.log("Na here urlArrayLength I hook");
    return JSON.stringify({
      message: "Check the link, It is not correct",
    });
  }

  const animeURL = urlArray.slice(1, 5).join("/");

  const hostname = "https://eng.cartoonsarea.cc/";
  const anime = await getAnimeSeason(hostname, animeURL);
  const seasonsWithEpisole = await getEpisoleInSeason(anime);
  const animeObj = await getVideoDetails(seasonsWithEpisole, anime);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), "utf8");
  }

  fs.readFile("./anime.json", "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data); //now it an object
      obj.push(animeObj); //add some datas
      json = JSON.stringify(obj); //convert it back to json
      fs.writeFile("./anime.json", json, "utf8", (err) => {
        if (err) throw err;

        console.log("Completed Writting");
      });
    }
  });
  return animeObj;
};
