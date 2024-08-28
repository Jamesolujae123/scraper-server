// server.js

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();

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
    // Define the local file path
    const filePath = path.join(
      "uploads",
      "downloaded-video-" + Date.now() + ".mp4"
    );

    // Stream the video data from the external URL
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream", // Stream response
    });

    // Save the video to the server
    response.data.pipe(fs.createWriteStream(filePath));

    // When the file is saved, respond with the file path
    response.data.on("end", () => {
      res.send(`Video downloaded and saved to ${filePath}`);
    });

    response.data.on("error", (err) => {
      console.error("Error saving video:", err);
      res.status(500).send("Error saving video");
    });
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
