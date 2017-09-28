let objs = {};
let online_user = {};

function add_c(x, y, r, n, is_player = false, is_super_ball = false,
               vx = parseInt(Math.random() * 4 - 2), vy = parseInt(Math.random() * 4 - 2)) {
    if (n in objs["c"]) return false;
    let tmp = {
        "x": x,
        "y": y,
        "r": r,
        "vx": vx,
        "vy": vy,
        "ax": 0,
        "ay": 0,
        "fr": 0.0001,
        "is_hit": false,
        "is_player": is_player,
        "is_super_ball": is_super_ball,
        "c": "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")"
    };
    if (is_super_ball) {
        tmp.fr = 0;
        tmp.vx = 3;
        tmp.vy = 3;
        tmp.c = "black";
    }
    else if (is_player) {
        tmp.vx = 0;
        tmp.vy = 0;
        tmp.fr = 0.05;
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
    if (left_monster < 20) {
        add_c(parseInt(Math.random() * 400 + 50), parseInt(Math.random() * 300 + 50),
            parseInt(Math.random() * 10) + 3, Math.ceil(Math.random() * 20));
    }
}

setInterval(spawn_monster, 500);

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
    add_c(parseInt(Math.random() * 400 + 50), parseInt(Math.random() * 300 + 50),
        3, ".", false, true);
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

function get_safe_place(r) {
    let tmp = {};
    for (let i = 0; i < 10; i++) {
        tmp = {x: Math.random() * 400 + 40, y: Math.random() * 300 + 50, r: r};
        for (let b of Object.keys(objs["c"])) {
            if (!is_ball_hit_ball(objs["c"][b], tmp)) {
                break;
            }
        }
    }
    return tmp;
}

function born(key) {
    b = objs["c"][key];
    b.is_hit = false;
    if (b.is_player) {
        b.r = b.r / 1.4;
        let t = get_safe_place(b.r);
        b.x = t.x;
        b.y = t.y;
        b.vx = 0;
        b.vy = 0;
        online_user[key]["area"] = b.r * b.r;
        if (b.r < 5) {
            online_user[key]["is_alive"] = false;
            delete b;
            return;
        }
        t = get_safe_place(b.r);
        add_c(t.x, t.y, t.r, key + "2", 0, 0);

    }
    else {
        if (b.r > 5) {
            let t = get_safe_place(b.r / 1.4);
            add_c(t.x, t.y, t.r, key + "1", 0, 0);
            t = get_safe_place(b.r / 1.4);
            add_c(t.x, t.y, t.r, key + "2", 0, 0);
        }
        delete b;
    }
}

function game_update() {
    for (let i of Object.keys(objs["c"])) {
        body_update(objs["c"][i]);
        check_hit_boarder(objs["c"][i]);
    }
    for (let i of Object.keys(objs["c"])) {
        if (objs["c"][i].is_hit) {
            born(i);
        }
    }
    let c_keys = Object.keys(objs["c"]);
    for (let i = 0; i < c_keys.length - 1; i++) {
        for (let j = i + 1; j < c_keys.length; j++) {
            let a = objs["c"][c_keys[i]], b = objs["c"][c_keys[j]];
            if (is_ball_hit_ball(a, b)) {
                if (a.is_super_ball) {
                    if (b.is_player) {
                        objs["c"][c_keys[j]]["is_hit"] = true;
                    }
                    continue;
                }
                if (b.is_super_ball) {
                    if (a.is_player) {
                        objs["c"][c_keys[i]]["is_hit"] = true;
                    }
                    continue;
                }
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