const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const BadRequest = require('../errors/bad-request-error');
const NotFound = require('../errors/not-found-error');
const Conflict = require('../errors/conflict-error');

// возвращает информацию о пользователе (email и имя)
const getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      const { name, email } = user;
      return res.status(200).send({ name, email });
    })
    .catch(next);
};

//  обновляет информацию о пользователе (email и имя)
const updateUserById = (req, res, next) => {
  const filter = {
    _id: req.user._id,
  };
  const newUserData = req.body;
  return User.findOneAndUpdate(filter, newUserData, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      const { name = 'Имя пользователя', email = 'Email' } = user;
      return res.status(200).send({ name, email });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequest(
            `${Object.values(err.errors)
              .map((error) => error.message)
              .join()}`,
          ),
        );
      }
      return next(err);
    });
};

// создаёт пользователя с переданными в теле
// email, password и name
const createUsers = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      User.create({
        email: req.body.email,
        password: hash,
        name: req.body.name,
      })
        .then((newUser) => {
          // eslint-disable-next-line
          const { password, ...others } = newUser._doc;
          return res.status(201).send(others);
        })
        .catch((err) => {
          if (err.code === 11000) {
            return next(new Conflict('Пользователь уже зарегистрирован'));
          }
          if (err.name === 'ValidationError') {
            if (err.message.includes('Path `name` is required')) {
              return next(new Conflict('Поле name является обязательным'));
            }
            return next(new Conflict(err.message));
          }
          return next(err);
        });
    })
    .catch();
};

//  проверяет переданные в теле почту и пароль
//  и возвращает JWT
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = generateToken(user);
      // отправка токена в ответе
      // return res.send({token})

      // Токен через cookies
      return res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'Авторизация прошла успешна!' });
    })
    .catch(next);
};

// Возможность выйти
const signOut = (req, res, next) => res
  .clearCookie('jwt')
  .status(200)
  .send({ message: 'Пользователь успешно вышел с сайта' })
  .catch(next);

module.exports = {
  getUserInfo,
  createUsers,
  login,
  signOut,
  updateUserById,
  // deleteUserById,
};
