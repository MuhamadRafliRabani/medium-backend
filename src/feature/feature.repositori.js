const { supabase } = require("../db");

const useGetArticleByTopic = async (topic, res) => {
  if (topic === "latest") {
    const { data } = await supabase.from("article").select("*");

    console.log("🚀 ~ useGetArticleByTopic ~ data:", data);
    return res.status(200).json({
      message: "Article with topic " + topic + " founded",
      data,
    });
  }

  const { data, error } = await supabase
    .from("article")
    .select("*")
    .eq("category", topic)
    .order("date", { ascending: true });
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

const useExistingArticle = async (article_id, res) => {
  const { data, error } = await supabase
    .from("article")
    .select("*")
    .eq("article_id", article_id)
    .single();

  if (error) {
    return res.status(error.code).json({
      errorMessage: error.message,
      error,
    });
  }

  return res.status(200).json({
    message: "Article with " + article_id + " founded",
    data,
    article: true,
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
    member_only,
  } = body;

  const { data, error } = await supabase.from("article").insert({
    title,
    description,
    article,
    user_name,
    user_image,
    content_image,
    category,
    member_only,
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
    .eq("user_id", user_id)
    .eq("article_id", article_id)
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

const useDeleteComment = async (comment_id, res) => {
  const { data, error } = await supabase
    .from("comment")
    .delete()
    .eq("id", comment_id);

  if (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }

  return res.status(200).json({
    message: "comment deleted",
    data,
  });
};

const useSignUp = async (email, password, res) => {
  const { data: user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }

  if (!user || user?.length == 0) {
    return res.status(200).json({
      message: "user not exist",
      user: null,
    });
  }

  return res.status(200).json({
    message: "user exist",
    user,
  });
};

const useSignIn = async (email, password, res) => {
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return res.status(400).json({
        message: "akun tidak ditemukan " + error.message,
        error,
      });
    } else if (error.message === "Email not confirmed") {
      return res.status(400).json({
        message: error.message,
        error,
      });
    }

    return res.status(500).json({
      message: error.message,
      error,
    });
  }

  if (!user || user?.length == 0) {
    return res.status(200).json({
      message: "user not exist",
      user: null,
    });
  }

  return res.status(200).json({
    message: "user exist",
    user,
  });
};

const useOauth = async (provider, res) => {
  if (provider == "github") {
    const { data: user, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });

    if (error) {
      return res.status(500).json({
        message: error.message,
        error,
      });
    }

    return res.redirect(user.url);
  }

  // if (provider == "google") {
  //   const { data: user, error } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //   });

  //   if (error) {
  //     return res.status(500).json({
  //       message: error.message,
  //       error,
  //     });
  //   }

  //   return res.status(200).json({
  //     message: "user exist",
  //     user,
  //   });
  // }

  // if (!user || user?.length == 0) {
  //   return res.status(200).json({
  //     message: "user not exist",
  //     user: null,
  //   });
  // }

  // return res.status(200).json({
  //   message: "user exist",
  //   user,
  // });
};

module.exports = {
  useGetArticleByTopic,
  useExistingArticle,
  publishArticle,
  useExistingLike,
  useLike,
  useUnLike,
  useExistingSubscribe,
  useSubscribe,
  useUnSubscribe,
  useExistingComment,
  useUploadComment,
  useDeleteComment,
  useSignUp,
  useSignIn,
  useOauth,
};
