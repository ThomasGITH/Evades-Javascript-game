var express = require('express');
var socket = require('socket.io');

var app = express();

//55030
var server = app.listen(55030, function() {
    console.log('listening to request on port 55030');
    console.log('');
});

app.use(express.static('game'));

var io = socket(server);

var idList = [];

var orbList = [];

for(var i = 0; i < 20; i++)
{
    var orb = [Math.random(), Math.random(), 4000 * (Math.random() * (0.8 - 0.1) + 0.1), 530 * (Math.random() * (0.9 - 0.1) + 0.1)];
    for(var j = 0; j < 2; j++) {
        orb[j] *= 10;
        orb[j] *= Math.random() >= 0.5 ? -1 : 1;
    }
    orbList.push(orb);
}

var lastTime = Date.now();

var timer = 0;

setInterval(function ()
{
    var thisTime = Date.now();
    var deltaTime = (thisTime - lastTime) / 100;
    lastTime = thisTime;

    timer += deltaTime / 10;

    if(timer > 1) //5 seconds
    {
        io.sockets.emit('orbUpdate',{
            orbs: orbList
        });
        timer = 0;
    }

    for(var i = 0; i < orbList.length; i++)
    {
        if(orbList[i][2] - 28.5 < 265){orbList[i][0] = Math.abs(orbList[i][0]);}
        if(orbList[i][2] + 28.5 > 4000 - 265){orbList[i][0] = -Math.abs(orbList[i][0]);}
        if(orbList[i][3] - 28.5 < 0){orbList[i][1] = Math.abs(orbList[i][1]);}
        if(orbList[i][3] + 28.5 > 530){orbList[i][1] = -Math.abs(orbList[i][1]);}

        orbList[i][2] += orbList[i][0] * 3.5 * deltaTime;
        orbList[i][3] += orbList[i][1] * 3.5 * deltaTime;

    }

});

io.on('connection', function(socket) {
    //console.log('made socket connection', socket.id);
    console.log('Player joined');

    socket.on('request_orbdata', function (data) {
        socket.emit('orb_data',{
            orbs: orbList
        });
    });

    socket.on('position', function (data) {
        socket.broadcast.emit('position', data);
    });

    socket.on('request_playerInfo', function (data) {
        socket.broadcast.emit('request_playerInfo', data);
    });

    socket.on('playerInfo', function (data) {
        socket.broadcast.emit('playerInfo', data);
    });

    socket.broadcast.to(socket.id).emit('self_id',{
        socket: socket.id
    });

    idList.push(socket.id);
    console.log('connected players: ' + idList.length);
    console.log('');
    socket.emit('id',{
        socket: socket.id
    });

    socket.on('disconnect', function(data) {
        socket.broadcast.emit('discon',{
            socket: socket.id
        });
        //console.log('Disconnected: ', socket.id);
        console.log('Player left');

        for(i = 0; i < idList.length; i++)
        {
            if(idList[i] === socket.id)
            {
                idList.splice(i,1);
            }
        }

        console.log('connected players: ' + idList.length)
        console.log('');

    });
});

//Orbs uitrekenen & updaten