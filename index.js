(function () {

    // var http = require('http');
    var util = require('util');
    var events = require('events');
    var request = require('superagent')
    // var url = require('url')
    // var debug = require('debug')('microservice-register')



    function Register(config){

        events.EventEmitter.call(this)

        this.routers = [{
            host: '127.0.0.1',
            port: 59000
        }];

        if(!config){ config = {}; }

        this.registerPath = '/router/register/';

        this.registered = false;

        this.registerCheckIntervalOriginal = config.checkInterval || (1000 * 1);
        this.registeredCheckInterval = config.registeredCheckInterval || 1000 * 60
        this.registerCheckIntervalCurrent = this.registerCheckIntervalOriginal


        if(config.routers){
            this.routers = config.routers
        }
        if(config.checkPath){
            this.checkPath = config.checkPath
        }
        if(config.registerPath){
            this.registerPath = config.registerPath
            if(!this.registerPath.match(/\/$/)){
                this.registerPath += '/'
            }
            if(!this.registerPath.match(/^\//)){
                this.registerPath = '/' + this.registerPath
            }
        }
        if(config.timeout){
            this.timeout = config.timeout
        }
        this.port = config.port
        this.service = config.service || 'service'
        this.aliases = config.alias || config.aliases


        var t = this

        this.routers.forEach(function(routerConfig){
            t.routerRegister(routerConfig);
        })



        return this;


    }

    util.inherits(Register, events)

    exports = module.exports = function(config){
        console.info('NEW')
        return new Register(config)
    }

    // use this to get a new, non cached object
	// Register.prototype.fresh = function(config) {
	// 	return new Register(config);
	// };


    Register.prototype.routerRegister = function(routerConfig){
    // function routerRegister(port, routerConfig, aliases){

        var t = this;
        if(!t.registered){
            console.info('routerRegister: ' + JSON.stringify(routerConfig))
        }

        var path =  t.registerPath + t.service  + '/' + t.port;

        var query = {};

        var url = 'http://' + routerConfig.host || '127.0.0.1';
        if(routerConfig.port){
            url += ':' + routerConfig.port
        }
        url += path

        if(t.checkPath){
            query.checkPath = t.checkPath
        }

        if(t.aliases){
            query.alias = t.aliases
        }

        var req = request
            .post(url)
            .query(query)
        if(t.timeout){
            req.timeout(t.timeout)
        }
        req.end(function(err){
            // catches 500 and 400
            if(err){
                console.log('problem with request: ' + err.message);
                t.emit('failed', err)
                t.reRegister(routerConfig)
                return
            }

            if(!t.registered){
                console.info('registration succesfull: ' + JSON.stringify(routerConfig))
                t.emit('registered')
            }
            t.registered = true;

            t.registerCheckIntervalCurrent = 0
            setTimeout(function(){
                t.routerRegister(routerConfig)
            }, t.registeredCheckInterval)

        });
    }

    Register.prototype.reRegister = function(routerConfig){

        console.info('trying to register with router: ' + JSON.stringify(routerConfig))

        var t = this;
        t.registered = false;

        if(!t.registerCheckIntervalCurrent){
            t.registerCheckIntervalCurrent = t.registerCheckIntervalOriginal
        }
        else if(t.registerCheckIntervalCurrent < t.registeredCheckInterval){
            t.registerCheckIntervalCurrent += 1000
        }

        setTimeout(function(){
            t.routerRegister(routerConfig)
        }, t.registerCheckIntervalCurrent)
    }

}).call(this)
