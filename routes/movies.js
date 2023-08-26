const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const auth = require("../middlewares/auth");
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require("../controllers/movies");

// возвращает все сохранённые текущим пользователем фильмы
router.get("", auth, getMovies);

// создаёт карточку
router.post(
  "",
  auth,
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      movieId: Joi.number().required(),
      image: Joi.string()
        .required()
        .pattern(
          // eslint-disable-next-line
          /(?:http|https):\/\/((?:[\w-]+)(?:\.[\w-]+)+)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
        ),
      trailerLink: Joi.string()
        .required()
        .pattern(
          // eslint-disable-next-line
          /(?:http|https):\/\/((?:[\w-]+)(?:\.[\w-]+)+)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
        ),
      thumbnail: Joi.string()
        .required()
        .pattern(
          // eslint-disable-next-line
          /(?:http|https):\/\/((?:[\w-]+)(?:\.[\w-]+)+)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
        ),
    }),
  }),
  createMovie,
);

// удаляет карточку по идентификатору
router.delete(
  "/:movieId",
  auth,
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string()
        .required()
        .min(24)
        .max(24)
        .pattern(/[a-z][0-9]+/),
    }),
  }),
  deleteMovie,
);

module.exports = router;
