// Useing Fetch
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  animeUrl:
    "https://eng.cartoonsarea.cc/English-Dubbed-Series/G-Dubbed-Series/Goblin-Slayer-Dubbed-Videos/#gsc.tab=0",
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow",
};

fetch("http://localhost:3000/anime", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

const axios = require("axios");
let data = JSON.stringify({
  animeUrl:
    "https://eng.cartoonsarea.cc/English-Dubbed-Series/G-Dubbed-Series/Goblin-Slayer-Dubbed-Videos/#gsc.tab=0",
});

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "http://localhost:3000/anime",
  headers: {
    "Content-Type": "application/json",
  },
  data: data,
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
