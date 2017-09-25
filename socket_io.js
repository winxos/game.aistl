var io = require('socket.io')();
var game = require('./game_server');
var _ = require('lodash'); //for deep clone, default installed
var _de = require('deep-equal'); //deep equal , npm install deep-equal
game.game_init();
game.game_update();

io.on('connect', function (socket) {
    let old_obj = {};

    function refresh_client() {
        let t = game.get_objs();
        if (!_de(old_obj, t)) {//deep equal
            socket.emit('game.aistl', t);
            old_obj = _.cloneDeep(t); //deep clone
        }
        setTimeout(refresh_client, 50);
    }

    refresh_client();
    socket.emit('online_user', game.get_user());
    socket.on('login', function (data) {
        if (!game.add_c(parseInt(Math.random() * 200 + 50), parseInt(Math.random() * 200 + 50), 20, data["name"])) {
            socket.emit('login', 'false');
            socket.send("false");
        }
        else {
            socket.emit('login', 'true');
            console.log(data["name"] + " joined.");
            socket.nickname = data["name"];
            io.sockets.emit('online_user', game.get_user());
        }
    });
    socket.on('disconnect', function (data) {
        console.log(socket.nickname + " quit.");
        game.remove_user(socket.nickname); //remove client
    });

    socket.on('input', function (data) {
        if ("keydown" in data) {
            game.control_user(data["nick"], data["keydown"])
        }
        if ("keyup" in data) {
            game.control_user(data["nick"], "release");
        }
    });
});

exports.listen = function (_server) {
    return io.listen(_server);
};