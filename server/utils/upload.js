module.exports = function (app) {
    app.use(require('multer')({
        dest: './dist/uploads/',
        rename: function (fieldname, filename) {
            function ran(length) {
                var result = "";
                var r = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
                for (var i = 0; i < length; i++) {
                    result += r.charAt(parseInt(Math.random() * r.length));
                }
                return result;
            }

            return Date.now() + ran(5);
        },
        onFileUploadStart: function (file) {
        },
        onFileUploadComplete: function (file) {
        }
    }));
};