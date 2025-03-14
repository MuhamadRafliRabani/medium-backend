const { supabase } = require("../db");
const {
  useExistingLike,
  useLike,
  useUnLike,
  useExistingSubscribe,
  useSubscribe,
  useUnSubscribe,
  useDeleteComment,
} = require("./feature.repositori");

const getLike = async (article_id, res) => {
  const { data: like, error } = await supabase
    .from("likes")
    .select("*")
    .eq("article_id", article_id);

  if (error) {
    return res.status(500).json({
      message: error.message,
      error: error,
    });
  }

  return res.status(200).json({
    message: "succes get like",
    data: like,
  });
};

const handleLike = async (user_id, article_id, res) => {
  const existingLike = await useExistingLike(user_id, article_id);

  if (existingLike) {
    return res.status(200).json({
      message: "user already like this article",
      data: existingLike,
    });
  }

  const Like = await useLike(user_id, article_id, res);
  return await Like;
};

const handleUnLike = async (user_id, article_id, res) => {
  const existingLike = await useExistingLike(user_id, article_id);

  if (!existingLike) {
    return res.status(200).json({
      message: "user not yet like this article",
    });
  }

  return await useUnLike(user_id, article_id, res);
};

const handleSubscribe = async (user_id, subscribe_to, res) => {
  const existingSubscribe = await useExistingSubscribe(user_id, subscribe_to);

  if (existingSubscribe) {
    return res.status(200).json({
      message: "user already subcribe this user",
      data: existingSubscribe,
    });
  }

  const subcribe = await useSubscribe(user_id, subscribe_to, res);
  return await subcribe;
};

const handleUnSubscribe = async (user_id, subscribe_to, res) => {
  const existingSubscribe = await useExistingSubscribe(user_id, subscribe_to);

  if (existingSubscribe) {
    const subcribe = await useUnSubscribe(user_id, subscribe_to, res);

    return await subcribe;
  }

  return res.status(200).json({
    message: "user not yet subcribe this user",
    data: existingSubscribe,
  });
};

const handleDeleteComment = async (user_id, comment_id, res) => {
  const { data: comment } = await supabase
    .from("comment")
    .select("*")
    .eq("user_id", user_id)
    .eq("id", comment_id);

  console.log(comment);

  if (comment.length != 0) {
    const DeleteComment = await useDeleteComment(comment_id, res);

    return await DeleteComment;
  }

  return res.status(200).json({
    message: "comment with id " + comment_id + " is not define",
    data: comment,
  });
};

module.exports = {
  handleSubscribe,
  handleDeleteComment,
  handleUnLike,
  handleLike,
  handleUnSubscribe,
  getLike,
};
