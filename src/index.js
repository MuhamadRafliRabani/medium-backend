const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const supabase = require("@supabase/supabase-js");

dotenv.config();

const PORT = process.env.PORT;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  const DataSupa = await db.from("medium-clone").select();

  console.log("Supabase Instance: ", DataSupa);
  res.send(DataSupa);
});

app.get("/article/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.json({
      id,
      message: "nilai undefined",
    });
  }

  const DataSupa = await db
    .from("medium-clone")
    .select("*")
    .eq("id", id)
    .single();

  console.log("Supabase Instance: ", DataSupa);
  res.send(DataSupa);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
