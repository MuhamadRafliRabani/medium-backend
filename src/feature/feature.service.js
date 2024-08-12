const { supabase } = require("../db");

const getUserByEmail = async (email) => {
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email);

  if (error) return { error, status: 500, massage: "something error" };
  if (user?.length !== 0) return { user, userExist: true };

  return { user, status: 200, massage: "get user", userExist: false };
};

const profilUserUpload = async (name, pronouns, short_bio, email, profil_img) => {
  const { userExist, user, status, massage } = await getUserByEmail(email);

  if (userExist) return { userExist, msg: "user exist", user, status, massage };

  const { data } = await supabase.from("users").insert({
    name,
    pronouns,
    short_bio,
    profil_img,
    email,
  });

  return { data, status: 200, massage: "upload user success", upload: true };
};

const profilUserUpdate = async (name, pronouns, short_bio, image, email) => {
  const { error } = await supabase
    .from("users")
    .update({
      name,
      pronouns,
      short_bio,
      profil_img: image,
    })
    .eq("email", email)
    .single();

  if (error) return { message: "Error updating profile", status: 400 };

  return { status: 200, massage: "updated profil success", update: true };
};

const storypublish = async (title, description, article, author_name, img_user, likes, date, type, image) => {
  const { data, error } = await supabase.from("medium-clone").insert({
    title,
    description,
    article,
    author_name,
    img_user,
    likes,
    date,
    type,
    img_content: image,
  });

  if (error) return { massage: "Error inserting story", publish: false, error };

  return { data, status: 200, publish: true };
};

const handleLike = async (id) => {
  const { data: prevData } = await supabase.from("medium-clone").select("likes").eq("id", id).single();

  const { data, error } = await supabase
    .from("medium-clone")
    .update({ likes: prevData.likes + 1 })
    .eq("id", id);

  if (error) return { error, like: false, message: "like failed", status: 500 };

  return { data, like: true, message: "like success", status: 200 };
};

const handleDisLike = async (id) => {
  const { data: prevData } = await supabase.from("medium-clone").select("likes").eq("id", id).single();

  const { data, error } = await supabase
    .from("medium-clone")
    .update({ likes: prevData.likes - 1 })
    .eq("id", id);

  if (error) return { error, dislike: false, message: "dislike failed", status: 500 };

  return { data, dislike: true, message: "dislike success", status: 200 };
};

const handleSubscribe = async (subscriber, subscribed_to, subscribe_at) => {
  const { data, error } = await supabase.from("subscribes").insert({ subscriber, subscribed_to, subscribe_at });

  if (error) return { subscribe: false, status: 500, message: "subsribe failed" };

  return { data, subscribe: true, status: 200, message: "subsribe success" };
};

const handleCheckSubscribe = async (subscriber, subscribed_to) => {
  const { data, error } = await supabase.from("subscribes").select("*").eq("subscriber", subscriber).eq("subscribed_to", subscribed_to);

  if (error) {
    return { error: error.message, status: 500 };
  }

  if (data.length !== 0) res.json({ subscriber: true, data, message: "alredy subscribe", status: 200 });
};

const commentUpload = async (idArticle, user, comment) => {
  const { data, error } = await supabase.from("comment").insert({
    idArticle,
    user,
    comment,
  });

  if (error) return { error, massage: "upload comment failed", status: 500 };

  return { data, massage: "comment uploded", status: 200 };
};

const getComment = async (idArticle) => {
  const { data, error } = await supabase.from("comment").select("*").eq("idArticle", idArticle);

  if (error) return { error, massage: "get comment failed", status: 500 };

  return { data, massage: "succes get comment", status: 200 };
};

module.exports = {
  handleCheckSubscribe,
  profilUserUpload,
  profilUserUpdate,
  handleSubscribe,
  getUserByEmail,
  handleDisLike,
  commentUpload,
  storypublish,
  handleLike,
  getComment,
};
