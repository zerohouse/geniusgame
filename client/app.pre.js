Array.prototype.contains = function (item) {
    return this.indexOf(item) != -1;
};


Array.prototype.remove = function (val, con) {
    if (con)
        if (!confirm('삭제하시겠습니까?'))
            return;
    this.splice(this.indexOf(val), 1);
};

Array.prototype.toggle = function (item) {
    if (this.contains(item)) {
        this.remove(item);
        return;
    }
    this.push(item);
};

String.prototype.toDateString = function () {
    return new Date(this.toString()).toString();
};
Date.prototype.toDateString = function () {
    return this.toString();
};


Date.prototype.toAmPm = function () {
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ampm;
};

Date.prototype.toString = function () {
    var month = '' + (this.getMonth() + 1),
        day = '' + this.getDate(),
        year = this.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var date = [year, month, day].join('.');
    return date + " " + this.toAmPm();
};

String.prototype.newLine = function () {
    return this.replace(/\n/g, '<br>');
};

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-67266885-1', 'auto');

var app = angular.module('resume', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAnimate']);
app.scope = {};
app.run(function ($rootScope, $location, $window) {
    $rootScope
        .$on('$stateChangeSuccess',
        function (event) {
            if (!$window.ga)
                return;
            $window.ga('send', 'pageview', {page: $location.path()});
        });
});

