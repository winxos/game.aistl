objs = {};
const speed = 0.5;

function add_c(x, y, r, n) {
    if (n in objs["c"]) return false;
    objs["c"][n] = {
        "x": x,
        "y": y,
        "r": r,
        "vx": 0,
        "vy": 0,
        "ax": 0,
        "ay": 0,
        'fr': 0.05,
        "c": "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")"
    };
    return true;
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
    return Object.keys(objs["c"]);
}

function remove_user(n) {
    if (n in objs["c"]) {
        delete objs["c"][n];
        return true;
    }
    return false;
}

function control_user(n, e) {
    switch (e) {
        case "left":
            objs["c"][n].ax = -speed;
            break;
        case "right":
            objs["c"][n].ax = speed;
            break;
        case "up":
            objs["c"][n].ay = -speed;
            break;
        case "down":
            objs["c"][n].ay = speed;
            break;
        case "release":
            objs["c"][n].ax = 0;
            objs["c"][n].ay = 0
    }
}

function game_init() {
    objs["c"] = {};
    for (let i = 0; i < 1; i++) {
        add_c(parseInt(Math.random() * 400 + 50), parseInt(Math.random() * 300 + 50), parseInt(Math.random() * 25) + 2, i);
    }
}

function game_update() {
    for (let i of Object.keys(objs["c"])) {
        objs["c"][i].vx += objs["c"][i].ax;
        objs["c"][i].vy += objs["c"][i].ay;
        objs["c"][i].vx *= 1 - objs["c"][i].fr;
        objs["c"][i].vy *= 1 - objs["c"][i].fr;
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

module.exports = {
    add_c, game_init, game_update, remove_user, control_user, get_objs, get_user
};