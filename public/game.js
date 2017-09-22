window.onload = function () {
    let socket = io.connect('ws://' + document.domain + ':' + location.port);
    let app = new Vue({
        el: '#app',
        data: {site: {}, nick: ""},
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
                socket.emit('login', {name: this.nick});
            }
        }
    });
    app.update();
    let keyBuf = {};
    var nick = "";
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
    let h = 500, w = 800;
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
        if (res == "false") {
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_SMALL,
                title: '加入失败',
                message: '昵称已经被使用,\n请更换后再加入。'
            });
        }
        else {
            nick = app.nick;
        }
    });
    socket.on('game.aistl', function (res) {
        new_balls = res["c"];
    });

    function lerp(min, max) {
        return parseInt((max - min ) * 0.2 + min);
    }

    function render() {
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
            g.font = "20px Arial";
            g.fillText(nb, balls[nb].x - parseInt(new_balls[nb].r) / 2, balls[nb].y + parseInt(new_balls[nb].r) / 2);
            g.closePath();
        }
    }
};