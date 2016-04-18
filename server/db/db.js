var db = {},
    mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/picks');

db.User = mongoose.model('user', mongoose.Schema({
    email: {type: String, index: true, unique: true},
    password: String,
    name: String,
    photo: String,
    score: Number
}));

db.User.schema.path('email').validate(function (value) {
    return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(value);
}, 'Invalid email');


db.Record = mongoose.model('record', mongoose.Schema({
    type: {type: String, index: true, unique: true},
    record: Object
}));

db.Article = mongoose.model('article', mongoose.Schema({
    type: String, align: String, user: Object, date: String, text: String
}));

db.passwordKey = mongoose.model('passwordKey', mongoose.Schema({
    email: {index: true, type: String, unique: true}, key: String, day: Number
}));

module.exports = db;