


var http = require('http');

var service = 'micro1'

var port;
var server = http.createServer(function(req, res){
    console.info(req.url)
    res.end('service provider, ' + service + ' : ' + port)
})

server.listen(0, function(){
    port = this.address().port
    console.info('port: ' + port)

    require('./index')({
        service: service,
        port: port,
        checkPath: '/up',
        host: '127.0.0.1'
    })

    // routers.forEach(function(config){
    //     routerRegister(port, config);
    // })

})
