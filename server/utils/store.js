var session = require('express-session'),
    redis = require('redis'),
    redisStore = require('connect-redis')(session),
    cookieParser = require('cookie-parser'),
    COOKIE_SECRET = 'secret',
    COOKIE_NAME = 'sid';
var client = redis.createClient(),
    store = new redisStore({host: 'localhost', port: 6379, client: client});
store.registerApp = function (app) {
    app.use(cookieParser(COOKIE_SECRET));
    app.use(session({
        name: COOKIE_NAME,
        store: store,
        secret: COOKIE_SECRET,
        saveUninitialized: true,
        resave: true,
        cookie: {
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge: null
        }
    }));
};
module.exports = store;
