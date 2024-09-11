const { supabase } = require("../db");
const { v4: uuidv4 } = require("uuid");

const handleImg = async (req) => {
  let image;

  if (req.file) {
    const { originalname, buffer } = req.file;
    const name = uuidv4() + originalname;

    const { error } = await supabase.storage
      .from("image-article-medium")
      .upload(`public/${name}`, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: req.file.mimetype,
      });

    if (error) return { msg: "Error saving image file", status: 400, error };

    image = `${process.env.SUPABASE_URL}/storage/v1/object/public/image-article-medium/public/${name}`;
  }

  return image;
};

module.exports = handleImg;
