var io = require('socket.io')();
objs = {};

function add_c(x, y, r, n) {
    if (n in objs["c"]) return false;
    objs["c"][n] = {
        "x": x,
        "y": y,
        "r": r,
        "vx": 0,
        "vy": 0,
        "c": "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")"
    };
    return true;
}

function game_init() {
    objs["c"] = {};
    for (let i = 0; i < 4; i++) {
        add_c(parseInt(Math.random() * 400 + 50), parseInt(Math.random() * 300 + 50), parseInt(Math.random() * 25) + 2, i);
    }
}

game_init();

function game_update() {
    for (let i in objs["c"]) {
        objs["c"][i].x += objs["c"][i].vx;
        objs["c"][i].y += objs["c"][i].vy;
        if ((objs["c"][i].x - objs["c"][i].r) < 20 || (objs["c"][i].x + objs["c"][i].r) > 500) {
            objs["c"][i].x -= objs["c"][i].vx;
            objs["c"][i].vx = -objs["c"][i].vx;
        }
        if ((objs["c"][i].y - objs["c"][i].r) < 20 || (objs["c"][i].y + objs["c"][i].r) > 400) {
            objs["c"][i].y -= objs["c"][i].vy;
            objs["c"][i].vy = -objs["c"][i].vy;
        }
    }
    setTimeout(game_update, 1000 / 60);
}

game_update();
io.on('connect', function (socket) {
    function refresh_client() {
        socket.emit('game.aistl', objs);
        setTimeout(refresh_client, 50);
    }

    refresh_client();
    socket.on('login', function (data) {
        if (!add_c(parseInt(Math.random() * 200 + 50), parseInt(Math.random() * 200 + 50), 20, data["name"])) {
            socket.emit('login', 'false');
            socket.send("false");
        }
        else {
            socket.emit('login', 'true');
        }
    });
    const speed = 2;
    socket.on('input', function (data) {
        if ("keydown" in data) {
            switch (data["keydown"]) {
                case "left":
                    objs["c"][data["nick"]].vx = -speed;
                    break;
                case "right":
                    objs["c"][data["nick"]].vx = speed;
                    break;
                case "up":
                    objs["c"][data["nick"]].vy = -speed;
                    break;
                case "down":
                    objs["c"][data["nick"]].vy = speed;
                    break;
            }
        }
        if ("keyup" in data) {
            objs["c"][data["nick"]].vx = 0;
            objs["c"][data["nick"]].vy = 0;
        }
    });
});

exports.listen = function (_server) {
    return io.listen(_server);
};