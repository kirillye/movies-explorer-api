require('dotenv').config();

const { PORT = 4000, DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;
const express = require('express');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const limiter = require('./utils/params/limiter');
const errorHandler = require('./middlewares/errorHandler');
const logErrors = require('./middlewares/logErrors');
const { reqLogger, errLogger } = require('./middlewares/log');

const app = express();
const routes = require('./routes');

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(limiter);
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    // eslint-disable-next-line
    console.log('connected to db');
  })
  .catch(() => {
    // eslint-disable-next-line
    console.log('error conected to db');
  });

app.use(logErrors);
app.use(reqLogger);
app.use(routes);
app.use(errLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`server is running on port ${PORT}`);
});
