module.exports = {
    key: function (length) {
        var ran = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789";
        var result = "";
        for (var i = 0; i < length; i++)
            result += ran[parseInt(Math.random() * ran.length)];
        return result;
    }
};