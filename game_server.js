let objs = {};
let online_user = {};

function add_c(x, y, r, n, is_player = false) {
    if (n in objs["c"]) return false;
    let tmp = {
        "x": x,
        "y": y,
        "r": r,
        "vx": 0,
        "vy": 0,
        "ax": 0,
        "ay": 0,
        'fr': 0.05,
        "is_player": is_player,
        "c": "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")"
    };
    for (let b of Object.keys(objs["c"])) {
        if (is_ball_hit_ball(objs["c"][b], tmp)) {
            return false;
        }
    }
    objs["c"][n] = tmp;
    return true;
}

function add_user(n) {
    if (n in objs["c"]) return false;
    let sz = 10;
    for (let i = 0; i < 5; i++) {
        if (add_c(parseInt(Math.random() * 200 + 50),
                parseInt(Math.random() * 200 + 50), sz, n, true)) {
            online_user[n] = {score: 0, area: sz * sz, is_alive: true};
            return true
        }
    }
    return false;
}

function get_objs() {
    let r = {c: {}};
    for (let d of Object.keys(objs["c"])) {
        r["c"][d] = {
            x: parseInt(objs["c"][d].x),
            y: parseInt(objs["c"][d].y),
            r: parseInt(objs["c"][d].r),
            c: objs["c"][d].c
        }
    }
    return r;
}

function get_user() {
    return online_user;
}

function remove_user(n) {
    if (n in objs["c"]) {
        delete objs["c"][n];
        delete online_user[n];
        return true;
    }
    return false;
}

function spawn_monster() {
    let left_monster = Object.keys(objs["c"]).length - Object.keys(online_user).length;
    if (left_monster < 10) {
        add_c(parseInt(Math.random() * 400 + 50), parseInt(Math.random() * 300 + 50),
            parseInt(Math.random() * 10) + 4, Math.ceil(Math.random() * 10));
    }
}

setInterval(spawn_monster, 5000);

function control_user(n, e) {
    if (!(n in objs["c"])) return;
    switch (e) {
        case "left":
            objs["c"][n].ax = -1.0 / objs["c"][n].r * 4;
            break;
        case "right":
            objs["c"][n].ax = 1.0 / objs["c"][n].r * 4;
            break;
        case "up":
            objs["c"][n].ay = -1.0 / objs["c"][n].r * 4;
            break;
        case "down":
            objs["c"][n].ay = 1.0 / objs["c"][n].r * 4;
            break;
        case "release":
            objs["c"][n].ax = 0;
            objs["c"][n].ay = 0
    }
}

function game_init() {
    objs["c"] = {};
}

function check_hit_boarder(b) {
    if ((b.x - b.r) < 0 || (b.x + b.r) > 600) {
        b.x -= b.vx;
        b.vx = -b.vx;
    }
    if ((b.y - b.r) < 0 || (b.y + b.r) > 400) {
        b.y -= b.vy;
        b.vy = -b.vy;
    }
}

function is_ball_hit_ball(a, b) {
    dist = ((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)) <= (a.r + b.r) * (a.r + b.r);
    return dist;
}

function body_update(b) {
    b.vx += b.ax;
    b.vy += b.ay;
    b.vx *= 1 - b.fr;
    b.vy *= 1 - b.fr;
    b.x += b.vx;
    b.y += b.vy;
}

function game_update() {
    for (let i of Object.keys(objs["c"])) {
        body_update(objs["c"][i]);
        check_hit_boarder(objs["c"][i]);
    }
    let c_keys = Object.keys(objs["c"]);
    for (let i = 0; i < c_keys.length - 1; i++) {
        for (let j = i + 1; j < c_keys.length; j++) {
            let a = objs["c"][c_keys[i]], b = objs["c"][c_keys[j]];
            if (is_ball_hit_ball(a, b)) {
                if (a.r > b.r * 1.1) {
                    a.r = Math.sqrt(a.r * a.r + b.r * b.r / 3.0);
                    if (a.is_player) {
                        online_user[c_keys[i]]["area"] = a.r * a.r;
                        online_user[c_keys[i]]["score"] += 1;
                    }
                    if (b.is_player) {
                        online_user[c_keys[j]]["is_alive"] = false;
                    }
                    delete objs["c"][c_keys[j]];
                }
                else if (b.r > a.r * 1.1) {
                    b.r = Math.sqrt(a.r * a.r / 3.0 + b.r * b.r);
                    delete objs["c"][c_keys[i]];
                    if (b.is_player) {
                        online_user[c_keys[j]]["area"] = b.r * b.r;
                        online_user[c_keys[j]]["score"] += 1;
                    }
                    if (a.is_player) {
                        online_user[c_keys[i]]["is_alive"] = false;
                    }
                }
                return;
            }
        }
    }
}

setInterval(game_update, 1000 / 60);
module.exports = {
    add_c, add_user, game_init, game_update, remove_user, control_user, get_objs, get_user
};