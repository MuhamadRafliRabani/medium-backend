const { supabase } = require("../db");
const {
  useExistingLike,
  useLike,
  useUnLike,
  useExistingSubscribe,
  useSubscribe,
  useUnSubscribe,
} = require("./feature.repositori");

const getUserByEmail = async (email) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);

  if (error) return { error, status: 500, massage: "something error" };
  if (user?.length !== 0) return { user, userExist: true };

  return { user, status: 200, massage: "get user", userExist: false };
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

module.exports = {
  handleSubscribe,
  getUserByEmail,
  handleUnLike,
  handleLike,
  handleUnSubscribe,
};
