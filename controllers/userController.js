const User = require('../models/User');
const Post = require('../models/Posts');
const bcrypt = require('bcrypt');
const validator = require('validator');

exports.getRegister = (req, res) => {
  res.render('users/index');
};

exports.postRegister = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('Por favor, preencha todos os campos.');
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send('Email inválido.');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('Este email já está em uso.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: passwordHash });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao registrar usuário.');
  }
};

exports.getLogin = (req, res) => {
  res.render("users/login");
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Informe email e senha.");
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send("Email inválido.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send("Usuário não encontrado");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).send("Senha incorreta");
  }

  req.session.user = user;
  res.redirect('/home');
};
