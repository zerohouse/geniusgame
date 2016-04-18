module.exports = function (app) {
    app.use(require('body-parser').json());

    app.use(function (req, res, next) {
        if (req.method == "GET")
            req.passed = req.query;
        else
            req.passed = req.body;
        next();
    });
};