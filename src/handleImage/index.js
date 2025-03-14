const { supabase } = require("../db");
const { v4: uuidv4 } = require("uuid");

const handleImg = async (req) => {
  if (!req.file) {
    throw new Error("No file provided");
  }

  const { originalname, buffer, mimetype } = req.file;
  const fileName = uuidv4() + ".jpg";

  const { error } = await supabase.storage
    .from("image-article-medium")
    .upload(`public/${fileName}`, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: mimetype,
    });

  if (error) {
    throw new Error(`Error saving image file: ${error.message}`);
  }

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/image-article-medium/public/${fileName}`;
};

module.exports = handleImg;
