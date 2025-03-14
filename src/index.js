const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const {
  useExistingArticle,
  useGetArticleByTopic,
  useSignUp,
  useSignIn,
  useOauth,
} = require("./feature/feature.repositori");

dotenv.config();

const PORT = process.env.PORT || 2000;

app.use(cors());
app.use(express.json());

app.get("/articles/:topic", async (req, res) => {
  const topic = req.params.topic;
  try {
    return await useGetArticleByTopic(topic, res);
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
      error,
    });
  }
});

app.get("/article/:article_id", async (req, res) => {
  try {
    const article_id = req.params.article_id;

    return await useExistingArticle(article_id, res);
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
      error,
    });
  }
});

app.post("/auth/email/:action", async (req, res) => {
  try {
    const { action } = req.params;
    const { email, password } = req.body;

    action === "signUp"
      ? await useSignUp(email, password, res)
      : useSignIn(email, password, res);
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
      error,
    });
  }
});

app.get("/Oauth/:provider", async (req, res) => {
  try {
    const { provider } = req.params;

    return await useOauth(provider, res);
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
