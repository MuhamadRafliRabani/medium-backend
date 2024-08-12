const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fileUpload = require("express-fileupload");
const useSetImage = require("./useSetImage");

dotenv.config();

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));

app.get("/:topic", async (req, res) => {
  const topic = req.params.topic;
  try {
    if (topic === "latest") {
      const { data, error } = await supabase.from("medium-clone").select("*");
      return res.json(data);
    }
    const { data, error } = await supabase.from("medium-clone").select("*").eq("type", topic);
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/article/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const { data, error } = await supabase.from("medium-clone").select("*").eq("id", id).single();
  if (error) {
    return res.status(500).send("Internal Server Error");
  }

  return res.json(data);
});

app.get("/feature/getuser/:email", async (req, res) => {
  const email = req.params.email;

  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();

  return res.json({ user, userStatus: true });
});

app.post("/feature/upload/profil-user", async (req, res) => {
  const { name, pronouns, short_bio, email, profil_img } = req.body;

  console.log(email);

  const { data: user, error } = await supabase.from("users").select("*").eq("email", email);

  console.log(user);

  if (user.length !== 0) return res.json({ isUser: true, msg: "user sudah ada", user });

  const { data } = await supabase.from("users").insert({
    name,
    pronouns,
    short_bio,
    profil_img,
    email,
  });

  return res.json({ data, update: true });
});

app.post("/feature/update/profil-user", async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ msg: "No images uploaded" });
  }

  const { name, pronouns, short_bio, email } = req.body;
  console.log({ name, pronouns, short_bio, email });

  let image;
  try {
    const file = req.files.image;
    const { url } = await useSetImage(file, req, res);
    image = url;
  } catch (error) {
    return res.status(error.status).json({ msg: error.msg });
  }

  const { data, error: updateError } = await supabase
    .from("users")
    .update({
      name,
      pronouns,
      short_bio,
      profil_img: image,
    })
    .eq("email", email)
    .single();

  if (updateError) {
    return res.json({ msg: "Error updating profile" });
  }

  return res.json({ data, update: true });
});

app.post("/feature/publish/new-story", async (req, res) => {
  const { title, description, article, author_name, img_user, likes, comment, date, type } = req.body;

  if (!req.files) return res.status(400).send("No files were uploaded.");

  let image;
  try {
    const file = req.files.image;
    const { url } = await useSetImage(file, req, res);
    image = url;
  } catch (error) {
    return res.status(error.status).json({ msg: error.msg });
  }

  const { data, error: insertError } = await supabase.from("medium-clone").insert({
    title,
    description,
    article,
    author_name,
    img_user,
    likes,
    comment,
    date,
    type,
    img_content: image,
  });

  if (insertError) {
    return res.status(500).send("Error inserting story");
  }

  res.status(200).json({ data, create: true });
});

app.patch("/feature/like", async (req, res) => {
  const { id } = req.body;

  try {
    const { data: prevData, error: fetchError } = await supabase.from("medium-clone").select("likes").eq("id", id).single();

    const { data, error } = await supabase
      .from("medium-clone")
      .update({ likes: prevData.likes + 1 })
      .eq("id", id);

    if (error) throw error;

    res.json({ data, like: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/feature/unlike", async (req, res) => {
  const { id } = req.body;

  try {
    const { data: prevData, error: fetchError } = await supabase.from("medium-clone").select("likes").eq("id", id).single();

    const { data, error } = await supabase
      .from("medium-clone")
      .update({ likes: prevData.likes - 1 })
      .eq("id", id);

    if (error) throw error;

    res.json({ data, like: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/feature/subcribe", async (req, res) => {
  const { subscriber, subscribed_to, subscribe_at } = req.body;

  const data = await supabase.from("subscribes").insert({ subscriber, subscribed_to, subscribe_at });

  res.json({ data, subscribe: true });
});

app.post("/feature/checkisSubscribe", async (req, res) => {
  const { subscriber, subscribed_to } = req.body;
  console.log({ subscriber, subscribed_to });

  const { data, error } = await supabase.from("subscribes").select("*").eq("subscriber", subscriber).eq("subscribed_to", subscribed_to);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (data !== null) res.json({ isSubscribed: true, data, message: "sudah subscribe" });
});

app.post("/feature/comment/upload", async (req, res) => {
  const { idArticle, user, comment } = req.body;

  const { data, error } = await supabase.from("comment").insert({
    idArticle,
    user,
    comment,
  });

  if (error) return res.json({ error, msg: "something error" });

  res.json({ data, msg: "comment uploded" });
});

app.listen(PORT, () => {
  `Listening on port ${PORT}`
});
