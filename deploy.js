let http = require('http');
let createHandler = require('github-webhook-handler');
let handler = createHandler({path: '/', secret: '112211'});

// 上面的 secret 保持和 GitHub 后台设置的一致

function run_cmd(cmd, args, callback) {
    let spawn = require('child_process').spawn;
    let child = spawn(cmd, args);
    let resp = "";

    child.stdout.on('data', function (buffer) {
        resp += buffer.toString();
    });
    child.stdout.on('end', function () {
        callback(resp)
    });
}

http.createServer(function (req, res) {
    handler(req, res, function () {
        res.statusCode = 404;
        res.end('no such location')
    })
}).listen(12345);

handler.on('error', function (err) {
    console.error('Error:', err.message)
});

handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
    run_cmd('sh', ['./deploy.sh', event.payload.repository.name], function (text) {
        console.log(text)
    });
});
