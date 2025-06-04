const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', homeController.getHome);
router.post('/', homeController.postHome);
router.get('/profile', homeController.getProfile);

router.post('/profile', upload.single('img'), async (req, res, next) => {
  if (req.file) {
    const userId = req.session.user._id;
    const filename = `profile_${userId}.webp`;
    const filepath = path.resolve(`public/uploads/${filename}`);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    await sharp(req.file.buffer)
      .resize(300, 300)
      .toFormat('webp')
      .toFile(filepath);
    req.file.filename = filename;
  }
  next();
}, homeController.postProfile);

router.get('/user/:id', homeController.getIdFollow);
router.post('/follow/:id', homeController.postIdFollow);
router.post('/unfollow/:id', homeController.postIdUnfollow)
router.get('/search', homeController.getUserSearch)
router.get('/messages', homeController.getmessages)
router.get('/messages/:id', homeController.getChatWithFriend);
router.post('/messages/:id', homeController.postChatWithFriend);

module.exports = router;
