const Movie = require("../models/Movie");
const BadRequest = require("../errors/bad-request-error");
const NotFound = require("../errors/not-found-error");
const ForbiddenError = require("../errors/forbidden-error");

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  return Movie.find({owner})
    .then((movies) => {
      return res.status(200).send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  let newMovieData = req.body;
  newMovieData.owner = req.user._id;
  return Movie.create(newMovieData)
    .then((newMovie) => {
      return res.status(201).send(newMovie);
    })
    .catch((err) => {
      if (err.name == "ValidationError") {
        return next(
          new BadRequest(
            `${Object.values(err.errors)
              .map((err) => err.message)
              .join()}`
          )
        );
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  const userId = req.user._id;
  const movieId = req.params.movieId;

  Movie.findOne({ _id: movieId })
    .orFail(() => {
      throw new NotFound("Фильм не найден");
    })
    .then((movie) => {
      if (userId === movie.owner.toString()) {
        return Movie.findByIdAndRemove(movie._id)
          .then((deletedMovie) => {
            return res.status(200).send(deletedMovie);
          })
          .catch(next);
      } else {
        next(new ForbiddenError("У вас нет прав на удаление этого фильма"));
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequest("id фильма не корректен"));
      } else {
        next(err);
      }
    });
};

// const likeCard = (req, res, next) => {
//   return Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
//     { new: true }
//   )
//     .then((card) => {
//       if (!card) {
//         throw new NotFound("Карточка не найдена");
//       }
//       return res.status(200).send(card);
//     })
//     .catch((err) => {
//       if (err.name == "CastError") {
//         return next(new BadRequest("id карточки не корректен"));
//       } else {
//         next(err);
//       }
//     });
// };

// const dislikeCard = (req, res, next) => {
//   return Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $pull: { likes: req.user._id } }, // убрать _id из массива
//     { new: true }
//   )
//     .then((card) => {
//       if (!card) {
//         throw new NotFound("Карточка не найдена");
//       }
//       return res.status(200).send(card);
//     })
//     .catch((err) => {
//       if (err.name == "CastError") {
//         return next(new BadRequest("id карточки не корректен"));
//       } else {
//         next(err);
//       }
//     });
// };

module.exports = { getMovies, createMovie, deleteMovie };