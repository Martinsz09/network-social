const Post = require("../models/Posts");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Follow = require("../models/Follow");
const Message = require("../models/Message");

exports.getHome = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  const posts = await Post.find().populate('user').sort({ createdAt: -1 });

  const profile = await Profile.findOne({ user: user._id });

  const profiles = await Profile.find({ user: { $in: posts.map(p => p.user._id) } });
  const profileMap = {};
  profiles.forEach(p => profileMap[p.user.toString()] = p.img);

  const suggestedUsers = await User.find({ _id: { $ne: user._id } }).limit(5);

  // NOVO: buscar os amigos (seguindo)
  const follows = await Follow.find({ follower: user._id });
  const friendIds = follows.map(f => f.following);
  const friends = await User.find({ _id: { $in: friendIds } });
  const friendProfiles = await Profile.find({ user: { $in: friendIds } });
  const friendProfileMap = {};
  friendProfiles.forEach(p => friendProfileMap[p.user.toString()] = p.img);

  res.render('home/home', {
    user,
    posts,
    profile,
    profileMap,
    suggestedUsers,
    friends,
    friendProfileMap
  });
};


exports.postHome = async (req, res) => {
  const { content } = req.body;
  const user = req.session.user;
  if (!content || !user) return res.status(400).send("Erro");
  await new Post({ content, user: user._id }).save();
  res.redirect("/home");
};

exports.getProfile = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect("/login");

  // Buscar posts com os usuários populados
  const posts = await Post.find().populate("user").sort({ createdAt: -1 });

  // Buscar perfil do usuário logado
  const profile = await Profile.findOne({ user: user._id });

  // Buscar perfis dos usuários que fizeram posts (para mostrar imagens nos cards, etc.)
  const profiles = await Profile.find({
    user: { $in: posts.map((p) => p.user._id) },
  });

  const profileMap = {};
  profiles.forEach((p) => {
    profileMap[p.user.toString()] = p.img;
  });

  const suggestedUsers = await User.find({ _id: { $ne: user._id } }).limit(5);


  const follows = await Follow.find({ follower: user._id });
  const friendIds = follows.map(f => f.following);

  const friends = await User.find({ _id: { $in: friendIds } });

  const friendProfiles = await Profile.find({ user: { $in: friendIds } });
  const friendProfileMap = {};
  friendProfiles.forEach(p => {
    friendProfileMap[p.user.toString()] = p.img;
  });


  res.render("home/profile", {
    user,
    posts,
    profile,
    profileMap,
    suggestedUsers,
    friends,
    friendProfileMap
  });
};


exports.postProfile = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect("/login");
  const bio = req.body.bio;
  const img = req.file ? "/uploads/" + req.file.filename : undefined;
  const data = { bio };
  if (img) data.img = img;
  await Profile.findOneAndUpdate({ user: user._id }, data, {
    upsert: true,
    new: true,
  });
  res.redirect("/home/profile");
};

exports.getIdFollow = async (req, res) => {
  const userId = req.params.id;
  const sessionUser = req.session.user;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send("Usuário não encontrado");
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    const profile = await Profile.findOne({ user: userId });
    let isFollowing = false;
    if (sessionUser && sessionUser._id !== userId) {
      const follow = await Follow.findOne({
        follower: sessionUser._id,
        following: userId,
      });
      isFollowing = !!follow;
    }
    res.render("home/userProfile", {
      user,
      posts,
      profile,
      sessionUser,
      isFollowing,
    });
  } catch (err) {
    res.status(500).send("Erro no servidor");
  }
};

exports.postIdFollow = async (req, res) => {
  const follower = req.session.user._id;
  const following = req.params.id;
  const exists = await Follow.findOne({ follower, following });
  if (!exists) {
    await Follow.create({ follower, following });
  }
  res.redirect("/home/user/" + following);
};

exports.postIdUnfollow = async (req, res) => {
  const follower = req.session.user._id;
  const following = req.params.id;
  const exists = await Follow.findOne({ follower, following });
  if (exists) {
    await Follow.deleteOne({ follower, following });
  }
  res.redirect("/home/user/" + following);
};

exports.getUserSearch = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect("/login");

    const term = req.query.q;

    if (!term || typeof term !== "string" || term.trim() === "") {
      return res.render("home/search", {
        user,
        profile: await Profile.findOne({ user: user._id }),
        usersFound: [],
        profileMap: {},
        term: "",
      });
    }

    const normalize = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const allUsers = await User.find({ _id: { $ne: user._id } });

    const usersFound = allUsers.filter((u) =>
      normalize(u.name).includes(normalize(term))
    );

    const profiles = await Profile.find({
      user: { $in: usersFound.map((u) => u._id) },
    });
    const profileMap = {};
    profiles.forEach((p) => (profileMap[p.user.toString()] = p.img));

    const profile = await Profile.findOne({ user: user._id });

    res.render("home/search", { user, profile, usersFound, profileMap, term });
  } catch (error) {
    console.error("Erro na busca de usuários:", error);
    res.status(500).send("Erro no servidor");
  }
};


exports.getmessages = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  const posts = await Post.find().populate('user').sort({ createdAt: -1 });

  const profile = await Profile.findOne({ user: user._id });

  const profiles = await Profile.find({ user: { $in: posts.map(p => p.user._id) } });
  const profileMap = {};
  profiles.forEach(p => profileMap[p.user.toString()] = p.img);

  const suggestedUsers = await User.find({ _id: { $ne: user._id } }).limit(5);



  const follows = await Follow.find({ follower: user._id });
  const friendIds = follows.map(f => f.following);
  const friends = await User.find({ _id: { $in: friendIds } });
  const friendProfiles = await Profile.find({ user: { $in: friendIds } });
  const friendProfileMap = {};
  friendProfiles.forEach(p => friendProfileMap[p.user.toString()] = p.img);

  res.render('home/messages', {
    user,
    posts,
    profile,
    profileMap,
    suggestedUsers,
    friends,
    friendProfileMap
  });
};



exports.getChatWithFriend = async (req, res) => {
  const user = req.session.user;
  const friendId = req.params.id;

  if (!user) return res.redirect('/login');

  const profile = await Profile.findOne({ user: user._id });
  const friend = await User.findById(friendId);
  const friendProfile = await Profile.findOne({ user: friendId });

  const messages = await Message.find({
    $or: [
      { from: user._id, to: friendId },
      { from: friendId, to: user._id }
    ]
  }).sort({ createdAt: 1 });

  res.render('home/userMessages', {
    user,
    profile,
    friend,
    friendProfile,
    messages
  });
};

exports.postChatWithFriend = async (req, res) => {
  const user = req.session.user;
  const friendId = req.params.id;
  const { message } = req.body;

  if (!user || !message) return res.redirect('/login');

  await Message.create({
    from: user._id,
    to: friendId,
    content: message
  });

  res.redirect(`/home/messages/${friendId}`);
};
