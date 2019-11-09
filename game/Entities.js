var socket = io.connect('http://10.120.18.42:55030/');

var deltaTime;
var socket_id = 0;
var name;

class Player {
    constructor(x,y){
        this.x=x;
        this.y=y;

        this.scaleX = 53;
        this.scaleY = 53;

        this.texture = new Image();

        this.radius = 25;

        this.moving_speed = 40;

        this.color = entityList[0].playerColor;

        socket.emit('playerInfo', {
            color: this.color,
            ID: entityList[0].ID,
            SID: socket_id
        });
    }

    update() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();
        context.stroke();
        context.fillStyle = 'black';
        context.font = "15px Arial";
        context.fillText(name, this.x - (name.length/2*7.5), this.y - this.radius - 4);
        context.closePath();

        if (hasCollidedCircle(this, Orb))
        {
            entityList.splice(1,1);
        }

        this.moving_speed = 40 * deltaTime;

    }
}

class Orb{
    constructor(x,y){

        this.localX = x;
        this.localY = y;

        this.x = entityList[0].x + x;
        this.y = entityList[0].y + y;

        this.scaleX = 53;
        this.scaleY = 53;

        this.texture = new Image();

        this.radius = 28.5;

        this.velX = 0;
        this.velY = 0;

        this.ID = 0;

        this.orbspeed = 3.5;
    }

    update() {

        if(this.x - this.radius < entityList[0].x + 265){this.velX = Math.abs(this.velX);}
        if(this.x + this.radius > entityList[0].x + entityList[0].scaleX - 265){this.velX = -Math.abs(this.velX);}
        if(this.y - this.radius < entityList[0].y){ this.velY = Math.abs(this.velY);}
        if(this.y + this.radius > entityList[0].y + entityList[0].scaleY){this.velY = -Math.abs(this.velY);}

        this.localX += this.velX * this.orbspeed * deltaTime;
        this.localY += this.velY * this.orbspeed * deltaTime;

        this.x = entityList[0].x + this.localX;
        this.y = entityList[0].y + this.localY;

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = 'grey';
        context.fill();
        context.stroke();
    }
}

class Map {
    constructor(x,y){
        this.x=x;
        this.y=y;

        this.scaleX = 4000;
        this.scaleY = 530;

        this.texture = new Image();
        this.texture.src = 'images/map.png';

        this.ID = Math.random() * Math.random() * 1000;

        this.playerColor = 'rgb(' + 255 * Math.random() + ', ' + 255 * Math.random() + ', ' + 255 * Math.random() + ')';

        this.lastTime = Date.now();
    }

    update(){

       var thisTime = Date.now();
        deltaTime = (thisTime - this.lastTime) / 100;
        this.lastTime = thisTime;

            if(Input['w'] && !(entityList[1].y - entityList[1].radius <= this.y))
            {
                this.y+=entityList[1].moving_speed;
            }
            if(Input['a'] && !(entityList[1].x  - entityList[1].radius <= this.x))
            {
                this.x+=entityList[1].moving_speed;
            }
            if(Input['s'] && !(entityList[1].y  + entityList[1].radius >= this.y + this.scaleY))
            {
                this.y-=entityList[1].moving_speed;
            }
            if(Input['d'] && !(entityList[1].x  + entityList[1].radius >= this.x + this.scaleX)) {
                this.x -= entityList[1].moving_speed;
            }
            //Transfer difference in player and map locations (to use as player position in other clients)
            socket.emit('position', {
                posX: entityList[1].x - this.x,
                posY: entityList[1].y - this.y,
                ID: this.ID
            });

    }

}

class CoPlayer {
    constructor(x,y){
        this.x=x;
        this.y=y;

        //spawn position
        this.dataX = 113.5;
        this.dataY = 208.5;

        this.scaleX = 53;
        this.scaleY = 53;

        this.texture = new Image();

        this.radius = 25;

        this.moving_speed = 4;

        this.ID = 0;
        this.col = 'black'; //default color

        this.socket_id = 0;
        this.name = "";

    }

    update() {

        this.x = entityList[0].x + this.dataX;
        this.y = entityList[0].y + this.dataY;

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.col;
        context.fill();
        context.stroke();
        context.fillStyle = 'black';
        context.font = "15px Arial";
        context.fillText(this.name,  this.x - (this.name.length/2*7.5), this.y - this.radius - 4);
        context.closePath();

    }
}

socket.on('position', function(data) {

    var iterations = entityList.length;
   for(i=0; i < iterations; i++)
   {
       if(entityList[i].ID === data.ID)
       {

           entityList[i].dataX = data.posX;
           entityList[i].dataY = data.posY;

           //Check whether this client has catched this player's socked ID and color, otherwise send request
           if(entityList[i].socket_id === 0)
           {
               socket.emit('request_playerInfo','requesting colors and SID from players');
           }

           break;
       }
       else if(i === (iterations - 1) && entityList[i].ID !== data.ID)
       {
           entityList.push(new CoPlayer(entityList[0].x + data.posX, entityList[0].y + data.posY));
           entityList[iterations].ID = data.ID;

           socket.emit('request_playerInfo','requesting colors and SID from new client');
       }
   }

});

socket.on('id', function(data) {
    if(socket_id === 0)
    {
        socket_id = data.socket;
    }
});

socket.on('request_playerInfo', function(data){
    socket.emit('playerInfo', {
        color: entityList[0].playerColor,
        ID: entityList[0].ID,
        SID: socket_id,
        name: name
    });
});

socket.on('playerInfo', function(data){
    for(i = 0; i < entityList.length; i++)
    {
        if(entityList[i].ID === data.ID)
        {
            entityList[i].col = data.color;
            entityList[i].socket_id = data.SID;
            entityList[i].name = data.name.length > 20 ? "my name is too long" : data.name;
            break;
        }
    }
});

socket.on('discon', function (data) {
    for(i = 0; i < entityList.length; i++)
    {
        if(entityList[i].socket_id === data.socket)
        {
            entityList.splice(i,1);
        }
    }
});

socket.on('orb_data', function (data) {
    console.log('received data');
    if(orbList === null)
    {
        orbList = data.orbs;
    }
});

socket.on('orbUpdate', function (data) {

    var orbIndex = 0;

    for(var i = 0; i < entityList.length; i++)
    {
        if(entityList[i] instanceof Orb)
        {
            entityList[i].velX = data.orbs[orbIndex][0];
            entityList[i].velY = data.orbs[orbIndex][1];
            entityList[i].localX = data.orbs[orbIndex][2];
            entityList[i].localY = data.orbs[orbIndex][3];
            orbIndex++;
        }
    }

    console.log('received data');
});