module.exports = function () {
    Array.prototype.contains = function (item) {
        return this.indexOf(item) != -1;
    };

    Array.prototype.remove = function (val) {
        if (this.contains(val))
            this.splice(this.indexOf(val), 1);
    };

};