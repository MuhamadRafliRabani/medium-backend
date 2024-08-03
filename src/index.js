const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fileUpload = require("express-fileupload");

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
  console.log(topic);
  try {
    if (topic === "latest") {
      const { data, error } = await supabase.from("medium-clone").select("*");
      return res.json(data);
    }
    const { data, error } = await supabase
      .from("medium-clone")
      .select("*")
      .eq("type", topic);
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/article/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const { data, error } = await supabase
    .from("medium-clone")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }

  return res.json(data);
});

app.post("/update/profil-user", async (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: "No images uploaded" });
  }
  const { name } = req.body;

  const file = req.files.file;
  const ext = path.extname(file.name);
  const filename = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${filename}`;
  const allowedTypes = [".png", ".jpg", ".jpeg"];

  if (!allowedTypes.includes(ext.toLowerCase())) {
    return res.status(422).json({ msg: "Invalid image format" });
  }
  if (file.size > 5000000) {
    return res.status(422).json({ msg: "Image size too big" });
  }

  file.mv(`./public/images/${filename}`, async (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error saving image file" });
    }

    const { data, error: updateError } = await supabase.from("users").update({
      name,
      filename,
      url,
    });
    if (updateError) {
      console.error(updateError);
      return res.status(500).send("Error updating profile");
    }

    return res.json({ data, update: true });
  });
});

app.post("/feature/publish/new-story", async (req, res) => {
  const {
    title,
    description,
    article,
    author_name,
    img_user,
    likes,
    comment,
    date,
    type,
  } = req.body;

  if (!req.files) return res.status(400).send("No files were uploaded.");

  const file = req.files.img_content;
  const ext = path.extname(file.name);
  const filename = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${filename}`;
  const allowedTypes = [".png", ".jpg", ".jpeg"];

  if (!allowedTypes.includes(ext.toLowerCase()))
    return res.status(422).json({ msg: "Invalid image format" });

  if (file.size > 5000000)
    return res.status(422).send({ msg: "Image size too big" });

  file.mv(`./public/images/${filename}`, async (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error saving image file");
    }

    const { data, error: insertError } = await supabase
      .from("medium-clone")
      .insert({
        title,
        description,
        article,
        author_name,
        img_user,
        likes,
        comment,
        date,
        type,
        img_content: url,
      });

    if (insertError) {
      console.error(insertError);
      return res.status(500).send("Error inserting story");
    }

    res.status(200).json({ data, create: true });
  });
});

app.patch("/feature/like", async (req, res) => {
  const { id } = req.body;

  try {
    const { data: prevData, error: fetchError } = await supabase
      .from("medium-clone")
      .select("likes")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from("subscribes")
      .update({ likes: prevData.likes + 1 })
      .eq("id", id);

    if (error) throw error;

    res.json({ data, like: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/feature/subcribe", async (req, res) => {
  const { subscriber, subscribed_to, subscribe_at } = req.body;

  const data = await supabase
    .from("subscribes")
    .insert({ subscriber, subscribed_to, subscribe_at });

  res.json({ data, subscribe: true });
});

app.post("/feature/check-subscription", async (req, res) => {
  const { subscriber, subscribed_to } = req.body;

  const { data, error } = await supabase
    .from("subscribes")
    .select("*")
    .eq("subscriber", subscriber)
    .eq("subscribed_to", subscribed_to)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (data !== null)
    res.json({ isSubscribed: true, data, message: "sudah subscribe" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
