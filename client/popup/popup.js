(function () {
    var scope;
    var pop;
    app.factory('popup', function () {
        var popup = {};
        pop = function (val, param) {
            popup.show = true;
            popup.state = val;
            scope.param = param;
            if (!scope.$$phase)
                scope.$apply();
        };
        pop.isShow = function () {
            return popup.show;
        };
        pop.getState = function () {
            return popup.state;
        };
        pop.hide = function () {
            popup.show = false;
        };
        return pop;
    });

    app.directive('popup', function () {
        return {
            restrict: 'A',
            link: function (s, e, a) {
                e.bind('click', function () {
                    var params = a.popup.split(',');
                    pop(params[0], params[1]);
                });
            }
        }
    });

    app.controller('popup', function ($scope, popup, socket) {
        scope = $scope;
        $scope.url = {};
        $scope.url.login = '/dist/popup/login/login.html';
        $scope.url.register = '/dist/popup/login/register.html';
        $scope.url.rooms = '/dist/popup/rooms/rooms.html';

        $scope.classes = {};
        $scope.classes.login = $scope.classes.register = $scope.classes.license = 'window-s';
        $scope.classes.rooms = 'window-s';
        $scope.popup = popup;


    });

})();