app.factory('req', function ($http) {
    var req = $http;
    req.get = function (url, data) {
        if (data != undefined) {
            url += "?";
            url += parse(data);
        }
        function parse(obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "="
                    + encodeURIComponent(obj[p]));
            return str.join("&");
        }

        return $http({
            method: "GET",
            url: url
        });
    };
    return req;
});
