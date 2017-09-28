window.onload = function () {
    let socket = io.connect('http://' + document.domain + ':' + location.port);
    let app = new Vue({
        el: '#app',
        data: {
            site: {},
            items: {},
            logs: {},
            nick: "",
            msg: "",
            join_disable: false
        },
        methods: {
            update: function () {
                axios.get('/update')
                    .then(function (response) {
                        console.log(response.data);
                        app.site = response.data;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            join: function () {
                if (this.nick === "") {
                    BootstrapDialog.show({
                        size: BootstrapDialog.SIZE_SMALL,
                        title: '提示',
                        message: '昵称为空,\n请输入昵称后再加入。'
                    });
                    return;
                }
                socket.emit('login', {name: this.nick});
            },
            send_msg: function () {
                if (this.msg != "") {
                    if (this.nick === "") {
                        BootstrapDialog.show({
                            size: BootstrapDialog.SIZE_SMALL,
                            title: '提示',
                            message: '请先加入游戏！'
                        });
                        return;
                    }
                    socket.emit('msg', {msg: this.msg});
                    this.msg = "";
                }
            },
            scroll: function () {
                let c = this.$el.querySelector("#logs_list");
                c.scrollTop = c.scrollHeight;
            }
        }
    });
    app.update();
    let keyBuf = {};
    let nick = "";
    const event_keys = {"37": "left", "39": "right", "38": "up", "40": "down"};
    addEventListener("keydown", (e) => {
        keyBuf[e.keyCode] = true;
        if (e.keyCode in event_keys) {
            socket.emit("input", {keydown: event_keys[e.keyCode], nick: [nick]});
        }
    }, false);
    addEventListener("keyup", (e) => {
        keyBuf[e.keyCode] = false;
        if (e.keyCode in event_keys) {
            socket.emit("input", {keyup: event_keys[e.keyCode], nick: [nick]});
        }
    }, false);
    let c = window.document.getElementById("canvas");
    let h = 400, w = 600;
    let balls = {}, new_balls = {};
    c.setAttribute('width', w);
    c.setAttribute('height', h);
    g = c.getContext("2d");

    function update() {

    }

    function game_loop() {
        g.clearRect(0, 0, w, h);
        update();
        render();
        requestAnimationFrame(game_loop);
    }

    game_loop();
    socket.on('login', function (res) {
        if (res === "false") {
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_SMALL,
                title: '加入失败',
                message: '昵称已经被使用,\n请更换后再加入。'
            });
        }
        else {
            nick = app.nick;
            app.join_disable = true;
        }
    });
    socket.on('game.aistl', function (res) {
        new_balls = res["c"];
    });
    let menu_poped = false;
    socket.on('online_user', function (data) {
        keysSorted = Object.keys(data).sort(function (a, b) {
            return data[b]["area"] - data[a]["area"];
        });
        console.log(keysSorted);
        let show_data = [];
        for (let u of keysSorted) {
            show_data.push(u + " | " + data[u].score + " | " + parseInt(data[u].area) + " | " + data[u].is_alive);
            if (u === nick && !data[u].is_alive && !menu_poped) {
                menu_poped = true;
                BootstrapDialog.show({
                    size: BootstrapDialog.SIZE_SMALL,
                    title: 'GAME OVER',
                    message: '你挂了！'
                });
            }
        }
        app.items = show_data;
    });
    socket.on('logs', function (data) {
        console.log("logs" + data);
        app.logs = data;
        app.scroll();
    });

    function lerp(min, max) {
        return parseInt((max - min ) * 0.2 + min);
    }

    function render() {
        g.strokeStyle = "BLUE";
        g.strokeRect(0, 0, w, h);
        for (let nb in new_balls) {
            if (!(nb in balls)) {
                balls[nb] = {"x": 0, "y": 0};
            }
            balls[nb].x = lerp(balls[nb].x, parseInt(new_balls[nb].x));
            balls[nb].y = lerp(balls[nb].y, parseInt(new_balls[nb].y));
            g.beginPath();
            g.fillStyle = new_balls[nb].c;
            g.lineWidth = 0;
            g.arc(balls[nb].x, balls[nb].y, parseInt(new_balls[nb].r), 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "white";
            g.font = "15px Arial";
            g.fillText(nb.substr(0, 2) + ".", balls[nb].x - parseInt(new_balls[nb].r) * 0.8, balls[nb].y + parseInt(new_balls[nb].r) / 2);
            g.closePath();
        }
    }
};