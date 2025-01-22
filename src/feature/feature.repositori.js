const { supabase } = require("../db");

const getArticleByTopic = async (topic, res) => {
  if (topic === "latest") {
    const { data, error } = await supabase.from("medium-clone").select("*");

    return res.status(200).json({
      message: "Article with topic " + topic + " founded",
      data,
    });
  }

  const { data, error } = await supabase
    .from("medium-clone")
    .select("*")
    .eq("type", topic);

  if (error)
    res.status(error.code).json({
      message: error.message,
      error,
    });

  return res.status(200).json({
    message: "Article with topic " + topic + " founded",
    data,
  });
};

const getArticleById = async (article_id, res) => {
  console.log("🚀 ~ getArticleById ~ article_id:", article_id);

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", article_id)
    .single();

  if (error) {
    return res.status(error.code).json({
      errorMessage: error.message,
      error,
    });
  }

  return res.status(200).json({
    message: "Article with " + article_id + " founded",
    data: data,
  });
};

const publishArticle = async (body, res) => {
  const {
    title,
    description,
    article,
    user_name,
    user_image,
    content_image,
    category,
  } = body;

  const { data, error } = await supabase.from("articles").insert({
    title,
    description,
    article,
    user_name,
    user_image,
    content_image,
    category,
  });

  if (error)
    return res.status(error.code).json({
      message: error.message,
      error,
    });

  return res.status(200).json({
    message: "Article succses published",
    data: data,
  });
};

const useExistingLike = async (user_id, article_id) => {
  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", parseInt(user_id))
    .eq("article_id", parseInt(article_id))
    .single();

  if (!existingLike) return null;

  return existingLike;
};

const useLike = async (user_id, article_id, res) => {
  const { error } = await supabase
    .from("likes")
    .insert([{ user_id, article_id }]);

  if (error) {
    return res.status(500).json({
      message: error.message,
      p: "ini eror di like",
      error,
    });
  }

  return res.status(200).json({
    message: "like succes",
    isLike: true,
  });
};

const useUnLike = async (user_id, article_id, res) => {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("user_id", user_id)
    .eq("article_id", article_id);

  if (error) {
    return res.status(500).json({
      message: error.message,
      p: "ini eror di unLike",
      error,
    });
  }

  return res.status(200).json({
    message: "unLike succes",
    isLike: false,
  });
};

const useExistingSubscribe = async (user_id, subscribe_to) => {
  const { data: existingSubscribe } = await supabase
    .from("subscribe")
    .select("*")
    .eq("user_id", parseInt(user_id))
    .eq("subscribe_to", parseInt(subscribe_to))
    .single();

  if (!existingSubscribe) return null;

  return existingSubscribe;
};

const useSubscribe = async (user_id, subscribe_to, res) => {
  const { error } = await supabase
    .from("subscribe")
    .insert({ user_id, subscribe_to });

  if (error) {
    return res.status(500).json({
      message: error.message,
      p: "ini eror di subscribe",
      error,
    });
  }

  return res.status(200).json({
    message: "subscribe succes",
    isSubsribe: true,
  });
};

const useUnSubscribe = async (user_id, subscribe_to, res) => {
  const { error } = await supabase
    .from("subscribe")
    .delete()
    .eq("user_id", user_id)
    .eq("subscribe_to", subscribe_to);

  if (error) {
    return res.status(500).json({
      message: error.message,
      p: "ini eror di unSubscribe",
      error,
    });
  }

  return res.status(200).json({
    message: "unSubscribe succes",
    isSubsribe: false,
  });
};

const useUploadComment = async (
  article_id,
  user_id,
  image,
  comment,
  user_name,
  res
) => {
  const { data, error } = await supabase.from("comment").insert({
    article_id,
    user_id,
    image,
    comment,
    user_name,
  });

  if (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }

  return res.status(200).json({
    message: "comment uploaded",
    data,
  });
};

const useExistingComment = async (article_id, res) => {
  const { data, error } = await supabase
    .from("comment")
    .select("*")
    .eq("article_id", article_id);

  if (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }

  return res.status(200).json({
    message: "succes get comment",
    data,
  });
};

module.exports = {
  getArticleByTopic,
  getArticleById,
  publishArticle,
  useLike,
  useUnLike,
  useSubscribe,
  useUnSubscribe,
  useUploadComment,
  useExistingLike,
  useExistingSubscribe,
  useExistingComment,
};
