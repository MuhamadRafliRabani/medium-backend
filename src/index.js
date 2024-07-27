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

app.get("/", async (req, res) => {
  const DataSupa = await supabase.from("medium-clone").select();

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

  const DataSupa = await supabase
    .from("medium-clone")
    .select("*")
    .eq("id", id)
    .single();

  res.send(DataSupa);
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

  res.json({ data: auth, created: true });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
