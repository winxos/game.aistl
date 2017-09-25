let io = require('socket.io')();
let game = require('./game_server');
let _ = require('lodash'); //for deep clone, default installed
let _de = require('deep-equal'); //deep equal , npm install deep-equal
let moment = require('moment');
game.game_init();
game.game_update();
let logs = [];
let old_obj = {};

function refresh_client() {
    let t = game.get_objs();
    if (!_de(old_obj, t)) {//deep equal
        io.sockets.emit('game.aistl', t);
        old_obj = _.cloneDeep(t); //deep clone
    }
    setTimeout(refresh_client, 50);
}

refresh_client();

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

function add_log(s) {
    logs.push(moment(Date.now()).format('YYYY-MM-DD hh:mm:ss> ') + s);
    console.log(logs);
    io.sockets.emit('logs', logs);
}

io.on('connect', function (socket) {


    socket.emit('online_user', game.get_user());
    socket.emit('game.aistl', game.get_objs());
    socket.emit('logs', logs);
    socket.nickname="";
    socket.on('login', function (data) {
        if (!game.add_c(parseInt(Math.random() * 200 + 50), parseInt(Math.random() * 200 + 50), 20, data["name"])) {
            socket.emit('login', 'false');
            socket.send("false");
        }
        else {
            socket.emit('login', 'true');
            socket.nickname = data["name"];
            io.sockets.emit('online_user', game.get_user());
            add_log(data["name"] + " joined. IP:" + socket.request.connection.remoteAddress);
        }
    });
    socket.on('disconnect', function () {
        if(socket.nickname!="")
        {
            console.log(socket.nickname + " quit.");
            add_log(socket.nickname + " quit.");
            game.remove_user(socket.nickname); //remove client
        }
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