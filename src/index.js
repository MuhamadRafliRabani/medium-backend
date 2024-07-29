const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const supabaseClient = require("@supabase/supabase-js");

dotenv.config();

const PORT = process.env.PORT;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());

app.use(express.json());

app.get("/:topic", async (req, res) => {
  const topic = req.params.topic;
  console.log(topic);
  try {
    if (topic === "latest") {
      const DataSupa = await supabase.from("medium-clone").select();
      return res.send(DataSupa);
    }
    const DataSupa = await supabase
      .from("medium-clone")
      .select("*")
      .eq("type", topic);
    return res.json(DataSupa);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/article/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.json({
      id,
      message: "nilai undefined",
    });
  }

  const DataSupa = await supabase
    .from("medium-clone")
    .select("*")
    .eq("id", id)
    .single();

  return res.send(DataSupa);
});

app.post("/publish/new-story", async (req, res) => {
  const {
    title,
    description,
    article,
    author_name,
    img_user,
    likes,
    comment,
    date,
    img_content,
    type,
  } = req.body;

  const DataSupa = await supabase.from("medium-clone").insert({
    title,
    description,
    article,
    author_name,
    img_user,
    likes,
    comment,
    date,
    img_content,
    type,
  });

  return res.send(DataSupa);
});

app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    return res.json({
      email,
      password,
      message: "nilai undefined",
    });
  }
  console.log(email, password);
  const auth = await supabase.auth.signUp({ email, password });

  return res.json({ data: auth, created: true });
});

app.post("/auth/logout", async (req, res) => {
  const auth = await supabase.auth.signOut();

  return res.json({ data: auth, logout: true });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
