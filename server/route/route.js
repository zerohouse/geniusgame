module.exports = function (app) {
    require('./user.js')(app);
    require('./article.js')(app);
    require('./mail.js')(app);
};