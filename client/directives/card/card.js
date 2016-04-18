app.directive('card', function () {
    return {
        restrict: 'E',
        templateUrl: '/dist/directives/card/card.html',
        scope: {
            front: '=',
            back: '='
        },
        controller: function ($scope) {
            var icon = $scope.icon = {};
            icon.e = 'fa fa-eye';
            icon.x = 'fa fa-ban';
            var description = $scope.description = {};
            description[0] = "X카드가 없고, 승자가 없을 경우 포인트를 나눠가집니다.";
            description[1] = "이 카드로 승리하면 추가로 칩을 하나씩 더 받습니다.";
            description[2] = "이 카드로 승리하면 추가로 칩을 하나씩 더 받습니다.";
            description[3] = "이 카드로 승리하면 추가로 칩을 하나씩 더 받습니다.";
            description['e'] = "다른 사람의 카드를 확인한 후 카드를 냅니다.";
            description['x'] = "아무도 승리하지 못합니다.";
        }
    }
});