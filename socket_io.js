var io = require('socket.io')();
objs = {};
function add_c(x, y, r, n) {
    if(n in objs["c"]) return false;
    objs["c"][n] = {
        "x": x,
        "y": y,
        "r": r,
        "vx": parseInt(Math.random() * 10 - 5),
        "vy": parseInt(Math.random() * 10 - 5),
        "c": "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")"
    };
    return true;
}

function game_init() {
    objs["c"] = {};
    for (let i = 0; i < 3; i++) {
        add_c(parseInt(Math.random() * 400 + 50), parseInt(Math.random() * 300 + 50), parseInt(Math.random() * 25) + 2,i);
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
        if(!add_c(parseInt(Math.random() * 200 + 50), parseInt(Math.random() * 200 + 50), 10, data["name"]))
        {
            console.log("already had");
        }
        console.log(objs);
    });
    socket.on('game.aistl', function (data) {
        console.log(data);
    });
});

exports.listen = function (_server) {
    return io.listen(_server);
};