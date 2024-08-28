const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const logger = require("./logger");

module.exports = (app) => {
  app.set("port", 3030);
  app.set("json spaces", 4);
  app.use(
    morgan("common", {
      stream: {
        write: (message) => {
          //logger.log(message);
          logger.info(message.trim());
        },
      },
    })
  );

  app.use(
    cors({
      origin: ["*"],
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.use(bodyParser.json());

  app.use(express.static("public"));
};
