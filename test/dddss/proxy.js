var http = require('http');
var HOST = process.argv[2];
var PORT = process.argv[3];
//var PROJ_PREFIX = '/' + (process.argv[4] || 'sjyx/');

// create http services, https protocol hasn't been supported now
var app = http.createServer(function(req, res) {
    // 查询本机ip
    var path = req.url;
    var result = /^[a-zA-Z]+:\/\/[^\/]+(\/.*)?$/.exec(req.url);
    if (result) {
        if (result[1].length > 0) {
            path = result[1];
        } else {
            path = "/";
        }
    }

    res.setHeader("Access-Control-Allow-Origin", "http://172.16.24.181:8090"); // replace * sign of your ip:appPort
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("X-Powered-By", "3.2.1");
    res.setHeader("Content-Type", "application/json;charset=utf-8");

    var chunks = [];
    var len = 0;

    console.log('=========================== Request starts:'+ (new Date().getTime()) +'=====================================\n');
    
    var param = {
		host: '172.16.1.52', // 目标主机
        port: '9005', // 目标主机
        path: path, // 目标路径
        method: req.method, // 请求方式
        headers: req.headers
    };
    console.log('Request params:\n');
    console.log(param);
    
    var sreq = http.request(param, function(sres) {
    	
        sres.on('data', function (chunk) {
    		chunks.push(new Buffer(chunk));
            len += chunk.length;
    	});

        sres.on('end', function() {
        	var resData = Buffer.concat(chunks, len);
            console.log('=========================== Response receieves:'+ (new Date().getTime()) +'=====================================\n');
            console.log(resData.toString());
            console.log('=====================================     end     ===============================================\n\n');
            res.write(resData);
			res.end();
        });
    });

    sreq.on('error', function(e) {
        console.log(e.message);
        sreq.end();
    });

    if (/POST|PUT/i.test(req.method)) {
        req.pipe(sreq);
    } else {
        sreq.end();
    }
});
// 访问172.16.24.181:3001查看效果
app.listen(3001);
console.log('server started on 172.16.24.181:3001');

usage();

function usage() {
    console.log('Usage:');
    console.log('node proxy.js [host] [port] [prefix]');
    console.log('\n\n');
}
