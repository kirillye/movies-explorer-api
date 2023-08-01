const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// const { BadRequest } = require("../util/errors");
const uniqueValidator = require("mongoose-unique-validator");
const Unauthorized = require("../errors/unauthorized-error");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxLength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: "Некорректный Email",
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  console.log(email, password);
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new Unauthorized("Неправильные почта или пароль");
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new Unauthorized("Неправильные почта или пароль");
        }

        return user;
      });
    });
};

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("user", userSchema);
