const router = require("express").Router();
const userRoutes = require("./users");
const movieRoutes = require("./movies");
const NotFound = require("../errors/not-found-error");

// главная страница
router.get("/", function (req, res) {
  res.send("hello world");
});

// Возможность уронить сервер
router.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Сервер сейчас упадёт");
  }, 0);
});

router.use("", userRoutes);
router.use("/movies", movieRoutes);

router.all("*", (req, res, next) => {
  next(new NotFound(`Ресурс по адресу ${req.path} не найден`));
});

module.exports = router;
