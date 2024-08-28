const express = require("express");
const app = express();
const configureMiddleware = require("./middlewares");
const anime = require("./anime");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const corsConfig = {
  origin: "*"
  credential: true,
  methods: [GET, POST, ]
};

//const port = 3000;

// Apply middleware
configureMiddleware(app);

app.use(cors(corsConfig));

app.get("/", (req, res) => {
  res.send(
    JSON.stringify({
      message: "Up and Gratefull",
    })
  );
});

app.post("/anime", async (req, res) => {
  const animeUrl = req.body.animeUrl;

  try {
    const animeInfo = await anime(animeUrl);
    res.json(animeInfo);
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Unrecognise Link, Check the link and try again!" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Up and running on port ${PORT}`);
});

//https://eng.cartoonsarea.cc/English-Dubbed-Series/G-Dubbed-Series/Golden-Time-Dubbed-Videos/

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // Custom file name
  },
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });

// Ensure the 'uploads' directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Route to download and save a video from an external URL
app.post("/download", async (req, res) => {
  const { videoUrl } = req.body; // Get the video URL from the request body

  if (!videoUrl) {
    return res.status(400).send("Video URL is required");
  }

  try {
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream", // Stream response to handle large files
    });

    // Set the appropriate headers for file download
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="downloaded-video.mp4"'
    );
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Pipe the response data to the client
    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).send("Error downloading video");
  }
});

// Route to serve the video
app.get("/videos/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join("uploads", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

app.get("/download-file", (req, res) => {
  const { videoUrl } = req.body; // Get the video URL from the request body

  res.download(videoUrl);
});
