const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const homeRoutes = require('./routes/HomeRoutes');

const app = express();

app.use(session({
  secret: 'minha_chave_secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', userRoutes);
app.use('/home', homeRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
