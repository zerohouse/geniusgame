app.directive('chat', function () {
    return {
        restrict: 'E',
        templateUrl: '/dist/directives/chat/chat.html',
        scope: {player: '=', setTo: '='},
        controller: function ($scope, socket, $timeout) {
            var chat = document.querySelector('.chat-window');
            var messages = $scope.messages = [];

            $scope.setTo = function (p) {
                if (p.sid == $scope.player.sid)
                    return;
                if (!$scope.message)
                    $scope.message = {};
                $scope.message.to = p;
            };

            socket.on('chat', function (message) {
                $scope.messages.push(message);
                $scope.$apply();
                $timeout(function () {
                    chat.scrollTop = chat.scrollHeight;
                });
            });

            $scope.send = function (message) {
                if (message.message == undefined || message.message == '')
                    return;
                $scope.message = {};
                $scope.message.to = message.to;
                message.date = new Date();
                socket.emit('chat', message);
                if (!message.to)
                    return;
                message.from = message.to;
                message.fromme = true;
                messages.push(message);
                $timeout(function () {
                    chat.scrollTop = chat.scrollHeight;
                });
            };
        }
    }
});