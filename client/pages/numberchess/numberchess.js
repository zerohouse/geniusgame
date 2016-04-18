app.controller('numberchess', function ($scope) {

    $scope.board = [];
    for (var i = 0; i < 9; i++)
        $scope.board.push([{}, {}, {}, {}, {}, {}]);

    $scope.units = [];
    for (var i = 1; i < 10; i++)
        $scope.units.push(new Unit(i))
    $scope.units.push(new Unit('bomb'));
    $scope.units.push(new Unit('bomb'));
    $scope.units.push(new Unit('bomb'));
    $scope.units.push(new Unit('king'));


    $scope.here = function (position) {
        if ($scope.selected == undefined)
            return;
        var tmp = position.unit;
        $scope.units.remove($scope.selected);
        position.unit = $scope.selected;
        if (tmp != undefined) {
            $scope.units.push(tmp);
        }
        $scope.selected = undefined;
    };


    $scope.select = function (unit) {
        $scope.selected = unit;
    };


    function Unit(val) {
        this.value = val;
    }

});