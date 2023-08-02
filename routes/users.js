const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const {
  getUserInfo,
  createUsers,
  login,
  // signOut,
  updateUserById,
  // deleteUserById,
} = require('../controllers/users');

// Информация о пользователе
router.get('/users/me', auth, getUserInfo);

// обновляет профиль
router.patch(
  '/users/me',
  auth,
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email({ minDomainSegments: 2 }),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  updateUserById,
);

// создание пользователя
router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email({ minDomainSegments: 2 }),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(3).max(30),
      avatar: Joi.string().pattern(
        // eslint-disable-next-line
        /(?:http|https):\/\/((?:[\w-]+)(?:\.[\w-]+)+)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
      ),
    }),
  }),
  createUsers,
);

// авторизация
router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email({ minDomainSegments: 2 }),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);

// разлогинирование
// router.post('/signout', auth, signOut);

// краш-тест
router.get('/crash-test', auth, () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

module.exports = router;
