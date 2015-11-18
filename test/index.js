(function() {
    var http = require('http')
    var assert = require('assert')
    var register = require('../index.js')


    // console.info(register)


    describe('register', function(){

        it('500 response', function(done){

            http.createServer(function(req, res){
                assert.equal(req.url, '/router/register/service/1234')
                res.statusCode = 500
                res.end()
            }).listen(function(){

                register({
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                }).once('failed', function(err){

                    assert(err.message.match(/Internal Server Error/i))
                    // this.dude = true
                    // console.info(this)
                    // console.info(this.listenerCount('failed'))
                    // console.info(this.listenerCount('registered'))
                    done()
                })

            });
        })

        it('400 response', function(done){

            http.createServer(function(req, res){
                assert.equal(req.url, '/router/register/web/1234')
                res.statusCode = 400
                res.end()
                // done()
            }).listen(function(){

                register({
                    service: 'web',
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                }).once('failed', function(err){
                    assert(err.message.match(/Bad Request/i))

                    // console.info(this)
                    // console.info(this.listenerCount('failed'))
                    // console.info(this.listenerCount('registered'))
                    done()
                })

            });
        });

        it('response timeout', function(done){
            http.createServer(function(req){
                assert.equal(req.url, '/router/register/web/12')
            }).listen(function(){

                var timeout = 50;

                register({
                    service: 'web',
                    timeout: timeout,
        		    port: 12,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                }).once('failed', function(err){
                    assert.equal(timeout, err.timeout)
                    done()
                });
            });
        })

        it('200, `registered` event', function(done){
            http.createServer(function(req, res){
                assert.equal(req.url, '/router/register/web/1234')
                res.end()
            }).listen(function(){
                register({
                    service: 'web',
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                }).on('registered', function(){
                    done()
                })
            });
        });

        it('multiple aliases', function(done){

            http.createServer(function(req){
                assert.equal(req.url, '/router/register/web/1234?alias=a&alias=b')
                done();
            }).listen(function(){

                register({
                    service: 'web',
                    aliases: ['a', 'b'],
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                })
            });
        });

        it('single alias', function(done){
            http.createServer(function(req){
                assert.equal(req.url, '/router/register/web/1234?alias=a')
                done();
            }).listen(function(){

                register({
                    service: 'web',
                    alias: 'a',
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                })
            });
        });

        it('register, checkInterval', function(done){
            var count = 0;
            http.createServer(function(req, res){
                count++;
                // console.info('count: ' + count)
                if(count > 1 && count < 4){
                    res.statusCode = 500
                }

                if(count == 6){
                    // res.status = 500
                    done()
                }
                res.end()
            }).listen(function(){

                register({
                    service: 'web',
                    checkInterval: 50,
                    registeredCheckInterval: 50,
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                })

            });
        })

        it('checkPath', function(done){

            http.createServer(function(req){
                assert.equal(req.url, '/router/register/web/1234?checkPath=%2F123')
                done();
            }).listen(function(){

                register({
                    service: 'web',
                    checkPath: '/123',
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                })
            });
        });

        it('registerPath', function(done){

            http.createServer(function(req){
                console.info('req.url: ' + req.url)
                assert.equal(req.url, '/register123/web/1234')
                done();
            }).listen(function(){

                register({
                // require('../index.js')({
                    service: 'web',
                    registerPath: 'register123',
        		    port: 1234,
                    routers: [{
                        host: '127.0.0.1',
                        port: this.address().port
                    }]
                // }).on('failed', function(){
                //     console.info(this)
                //     // assert(err.message.match(/Internal Server Error/i))
                //     // this.dude = true
                //     done()
                })
            });
        });




    })


}).call(this);
