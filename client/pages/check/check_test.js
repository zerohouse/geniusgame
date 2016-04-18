describe('mainController', function () {
    describe('mainScope', function () {
        it('value Test', function () {
            var $scope = {};
            var controller = $controller('main', {$scope: $scope});
            expect($scope.name).toEqual('main');
        });
    });
});