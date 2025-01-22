const express = require("express");
const {
  getUserByEmail,
  handleLike,
  handleSubscribe,
  handleUnLike,
  handleUnSubscribe,
} = require("./feature.service");
const router = express.Router();
const upload = require("../multer");
const handleImg = require("../handleImage");
const {
  useUploadComment,
  publishArticle,
  useExistingComment,
} = require("./feature.repositori");

router.get("/getuser/:email", async (req, res) => {
  const email = req.params.email;

  const data = await getUserByEmail(email);

  return res.json(data);
});

router.post("/upload/article", upload.single("image"), async (req, res) => {
  try {
    const { title, description, article, user_name, user_image, category } =
      req.body;

    const image = await handleImg(req);

    if (!image) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const body = {
      title,
      description,
      article,
      user_name,
      user_image,
      content_image: image,
      category,
    };

    return await publishArticle(body, res);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
});

router.patch("/like/:user_id/:article_id", async (req, res) => {
  try {
    const { article_id, user_id } = req.params;

    return await handleLike(user_id, article_id, res);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

router.patch("/unLike/:user_id/:article_id", async (req, res) => {
  try {
    const { user_id, article_id } = req.params;

    const data = await handleUnLike(user_id, article_id, res);

    return await data;
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

router.patch("/subscribe/:user_id/:subscribe_to", async (req, res) => {
  try {
    const { user_id, subscribe_to } = req.params;

    return await handleSubscribe(user_id, subscribe_to, res);
  } catch (error) {
    return res.status(500).json({
      message: error.message,

      error: error,
    });
  }
});

router.patch("/unSubscribe/:user_id/:subscribe_to", async (req, res) => {
  try {
    const { user_id, subscribe_to } = req.params;

    return await handleUnSubscribe(user_id, subscribe_to, res);
  } catch (error) {
    return res.status(500).json({
      message: error.message,

      error: error,
    });
  }
});

router.post("/upload/comment", async (req, res) => {
  try {
    const { article_id, user_id, image, comment, user_name } = req.body;

    return await useUploadComment(
      article_id,
      user_id,
      image,
      comment,
      user_name,
      res
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
});

router.get("/comment/:article_id", async (req, res) => {
  try {
    const { article_id } = req.params;

    return await useExistingComment(article_id, res);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
});

module.exports = router;
