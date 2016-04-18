app.factory('socket', function (user, $state, $timeout) {
    var socket = io('/', {path: '/socket.io', 'multiplex': false});

    var yo = false;
    console.log('yo start');
    socket.on('connect', function () {
        console.log('yo received');
        yo = true;
    });
    yelling();

    function yelling() {
        console.log('yo');
        if (yo)
            return;
        socket.disconnect();
        socket.connect('/', {path: '/socket.io', 'multiplex': false});
        $timeout(yelling, 1000);
    }

    socket.on('redirect', function (send) {
        if (send.message)
            alert(send.message);
        $state.go(send.state, send.params);
    });

    var on = socket.on.bind(socket);
    var events = {};

    socket.on = function (name, fn) {
        if (events[name]) {
            socket.removeListener(name, events[name]);
        }
        on(name, fn);
        events[name] = fn;
    };

    return socket;
});