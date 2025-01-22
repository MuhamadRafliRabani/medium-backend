const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const {
  getArticleByTopic,
  getArticleById,
} = require("./feature/feature.repositori");

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/article/:topic", async (req, res) => {
  const topic = req.params.topic;
  try {
    return await getArticleByTopic(topic, res);
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
      error,
    });
  }
});

app.get("/article/:article_id", async (req, res) => {
  try {
    const { article_id } = req.params;

    return await getArticleById(article_id, res);
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
      error,
    });
  }
});

const featureContorler = require("./feature/feature.controler");

app.use("/feature", featureContorler);

app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});
