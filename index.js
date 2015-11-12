(function () {

    var http = require('http');
    var debug = require('debug')('microservice-register')

    var routers = [{
        host: '127.0.0.1',
        port: 59000
    }];
    var port;
    var service

    var registerCheckIntervalOriginal = 1000 * 1;
    var registeredCheckInterval = 1000 * 60
    var registerCheckIntervalCurrent = registerCheckIntervalOriginal

    function Register(config){
        if(!config){ config = {}; }

        if(config.routers){
            routers = config.routers
        }
        port = config.port
        service = config.service

        // routerRegister(port, routers);
        routers.forEach(function(config){
            routerRegister(port, config);
        })
    }

    module.exports = function(config){
        return new Register(config)
    }

    function routerRegister(port, routerConfig){

        console.info('routerRegister: ' + JSON.stringify(routerConfig))

        var req = http.request({
            method: 'POST',
            port: routerConfig.port || 5050,
            host: routerConfig.host || '127.0.0.1',
            path: '/router/register/' + service  + '/' + port
        }, function(res){

            if(res.statusCode == 200){
                console.info('registration succesfull: ' + JSON.stringify(routerConfig))
                registerCheckIntervalCurrent = 0
                setTimeout(function(){
                    routerRegister(port, routerConfig)
                }, registeredCheckInterval)

            }
            else{
                reRegister(port, routerConfig)
                // setTimeout(function(){
                //     routerRegister(port, routerConfig)
                // }, 1000 * 3)
            }
        })

        req.end();
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            reRegister(port, routerConfig)

        });
    }

    function reRegister(port, routerConfig){
        if(!registerCheckIntervalCurrent){
            registerCheckIntervalCurrent = registerCheckIntervalOriginal
        }
        else if(registerCheckIntervalCurrent < registeredCheckInterval){
            registerCheckIntervalCurrent += 1000
        }

        setTimeout(function(){
            routerRegister(port, routerConfig)
        }, registerCheckIntervalCurrent)
    }

}).call(this)