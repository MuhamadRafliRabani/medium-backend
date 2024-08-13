const express = require("express");
const { getUserByEmail, profilUserUpload, profilUserUpdate, storypublish, handleDisLike, handleLike, handleSubscribe, handleCheckSubscribe, commentUpload, getComment } = require("./feature.service");
const router = express.Router();
const upload = require("../multer");
const handleImg = require("../handleImage");

router.get("/getuser/:email", async (req, res) => {
  const email = req.params.email;

  const data = await getUserByEmail(email);

  return res.json(data);
});

router.post("/profil-user/upload", async (req, res) => {
  const { name, pronouns, short_bio, email, profil_img } = req.body;

  const data = await profilUserUpload(name, pronouns, short_bio, email, profil_img);

  return res.send(data);
});

router.post("/profil-user/update", upload.single("image"), async (req, res) => {
  const { name, pronouns, short_bio, email } = req.body;

  const image = await handleImg(req);
  if (image) {
    const data = await profilUserUpdate(name, pronouns, short_bio, image, email);
    return res.send(data);
  }
});

router.post("/story/publish", upload.single("image"), async (req, res) => {
  const { title, description, article, author_name, img_user, likes, date, type } = req.body;

  const image = await handleImg(req);
  console.log(image);

  if (image) {
    const data = await storypublish(title, description, article, author_name, img_user, likes, date, type, image);

    res.send(data);
  }
});

router.patch("/like/:id", async (req, res) => {
  const id = req.params.id;
  const data = await handleLike(id);
  res.send(data);
});

router.patch("/dislike/:id", async (req, res) => {
  const id = req.params.id;

  const data = await handleDisLike(id);

  res.send(data);
});

router.post("/subcribe", async (req, res) => {
  const { subscriber, subscribed_to, subscribe_at } = req.body;

  const data = await handleSubscribe(subscriber, subscribed_to, subscribe_at);

  res.send(data);
});

router.post("/checkIsSubscribe", async (req, res) => {
  const { subscriber, subscribed_to } = req.body;
  console.log({ subscriber, subscribed_to });

  const data = await handleCheckSubscribe(subscriber, subscribed_to);

  res.send(data);
});

router.post("/comment/upload", async (req, res) => {
  const { idArticle, user, comment, email, time } = req.body;

  const data = await commentUpload(idArticle, user, comment, email, time);

  res.send(data);
});

router.get("/comment/:idArticle", async (req, res) => {
  const { idArticle } = req.params;
  console.log(idArticle);

  const data = await getComment(idArticle);

  res.send(data);
});

module.exports = router;
