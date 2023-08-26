const Movie = require("../models/Movie");
const BadRequest = require("../errors/bad-request-error");
const NotFound = require("../errors/not-found-error");
const ForbiddenError = require("../errors/forbidden-error");

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  return Movie.find({ owner })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const newMovieData = req.body;
  newMovieData.owner = req.user._id;
  return Movie.create(newMovieData)
    .then((newMovie) => res.status(201).send(newMovie))
    .catch((err) => {
      if (err.name === "ValidationError") {
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

const deleteMovie = (req, res, next) => {
  const userId = req.user._id;
  const { movieId } = req.params;

  Movie.findOne({ _id: movieId })
    .orFail(() => {
      throw new NotFound("Фильм не найден");
    })
    .then((movie) => {
      if (userId === movie.owner.toString()) {
        return Movie.findByIdAndRemove(movie._id)
          .then((deletedMovie) => res.status(200).send(deletedMovie))
          .catch(next);
      }
      return next(
        new ForbiddenError("У вас нет прав на удаление этого фильма"),
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequest("id фильма не корректен"));
      } else {
        next(err);
      }
    });
};

module.exports = { getMovies, createMovie, deleteMovie };
