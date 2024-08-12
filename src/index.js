const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { supabase } = require("./db");

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

const featureContorler = require("./feature/feature.controler");

app.use("/feature", featureContorler);

app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});
