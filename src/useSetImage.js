const path = require("path");

const useSetImage = (file, req, res) => {
  const ext = path.extname(file?.name);
  const filename = file?.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${filename}`;
  const allowedTypes = [".png", ".jpg", ".jpeg"];

  if (!allowedTypes.includes(ext.toLowerCase())) {
    return Promise.reject({ status: 422, msg: "Invalid image format" });
  }
  if (file.size > 5000000) {
    return Promise.reject({ status: 422, msg: "Image size too big" });
  }

  return new Promise((resolve, reject) => {
    file.mv(`./public/images/${filename}`, (error) => {
      if (error) {
        console.error(error);
        reject({ status: 500, msg: "Error saving image file" });
      } else {
        resolve({ url, filename });
      }
    });
  });
};

module.exports = useSetImage;
