(function () {
    var scope;
    app.controller('alert', function ($scope, socket, alert) {
        scope = $scope;
        $scope.alerts = [];
    });
    app.factory('alert', function ($timeout, socket) {
        var alert = function (message, success, duration) {
            if (!duration) {
                duration = 3000;
                $timeout.cancel(this.hide);
            }
            this.hide = $timeout(function () {
                scope.showing = false;
            }, duration);
            var al = {alert: message, date: new Date(), success: success};
            scope.alerts.push(al);
            $timeout(function () {
                scope.alerts.remove(al);
            }, duration);
            scope.alert = al;
            scope.showing = true;
            if (!scope.$$phase) {
                scope.$apply();
            }
        };

        socket.on('alert', function (message) {
            alert(message.message, !message.fail, message.duration);
        });

        alert.getAlerts = function () {
            return scope.alerts;
        };
        return alert;
    });
})();