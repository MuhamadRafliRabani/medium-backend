const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { supabase } = require("./db");
const multer = require("multer");

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

app.get("/getImage", async (req, res) => {
  const { data, error } = await supabase.storage.from("image-article-medium").select("*");
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

app.post("/feature/update/profil-user", upload.single("image"), async (req, res) => {
  const { name, pronouns, short_bio, email } = req.body;
  console.log({ name, pronouns, short_bio, email });

  let image;

  try {
    // Pastikan file telah diunggah
    if (req.file) {
      const { originalname, buffer } = req.file;

      // Upload gambar ke Supabase Storage
      const { data, error } = await supabase.storage
        .from("image-article-medium") // Ganti dengan nama bucket Anda
        .upload(`public/${originalname}`, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error("Upload error:", error);
        return res.status(400).json({ msg: "Error saving image file" });
      }

      // Jika berhasil, dapatkan URL gambar yang diupload
      image = `${process.env.SUPABASE_URL}/storage/v1/object/public/image-article-medium/public/${originalname}`;
      console.log("Image URL:", image);
    }

    // Update profil pengguna di Supabase
    const { data: userData, error: updateError } = await supabase
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
      console.error("Update error:", updateError);
      return res.status(400).json({ msg: "Error updating profile" });
    }

    return res.json({ data: userData, update: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.post("/feature/publish/new-story", upload.single("image"), async (req, res) => {
  const { title, description, article, author_name, img_user, likes, comment, date, type } = req.body;

  let image;
  try {
    const { originalname, buffer } = req.file;

    const { data, error } = await supabase.storage
      .from("image-article-medium") // Ganti dengan nama bucket Anda
      .upload(`public/${originalname}`, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: req.file.mimetype,
      });

    if (error) {
      throw error;
    }

    // Jika berhasil, kirim URL gambar yang diupload
    const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/image-article-medium/public/${originalname}`;
    console.log(url);

    image = url;
  } catch (error) {
    return res.status(error.status).json({ msg: error.msg });
  }

  // const handleImg = await (req) => {
  //   try {

  //   const { originalname, buffer } = req.file;

  //     const { data, error } = await supabase.storage
  //       .from("image-article-medium") // Ganti dengan nama bucket Anda
  //       .upload(`public/${originalname}`, buffer, {
  //         cacheControl: "3600",
  //         upsert: false,
  //         contentType: req.file.mimetype,
  //       });

  //     if (error) {
  //       throw error;
  //     }

  //     // Jika berhasil, kirim URL gambar yang diupload
  //     const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/image-article-medium/public/${originalname}`;
  //     console.log(url);
  //     return {url}
  //   } catch (error) {
  //     return {error}
  //   }
  // }

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

app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});
