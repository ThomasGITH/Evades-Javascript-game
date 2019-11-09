var canvas;
var context;

var entityList = [];
var Input={};

var orbList = null;

function start() {
    entityList.push(new Map((canvas.width/2) - 140, canvas.height/2 - 530/2));
    entityList.push(new Player((canvas.width/2) + 25, (canvas.height/2)-25));

    Input = {"w":false,"a":false,"s":false,"d":false,"ArrowUp":false,"ArrowLeft":false,"ArrowDown":false,"ArrowRight":false, " ":false, "Enter":false}
}

var addedOrbs = false;

var TEMP_INDEX;

function MainLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(MainLoop);

    if(orbList !== null && !addedOrbs)
    {
        for(var i = 0; i < orbList.length; i++) {
            entityList.push(new Orb(orbList[i][2], orbList[i][3]));
            entityList[entityList.length - 1].velX = orbList[i][0];
            entityList[entityList.length - 1].velY = orbList[i][1];
            TEMP_INDEX = entityList.length -1;
        }
        addedOrbs = true;
    }


    for(i=0;i<entityList.length;i++){
        entityList[i].update();
        context.drawImage(entityList[i].texture,entityList[i].x,entityList[i].y, entityList[i].scaleX, entityList[i].scaleY);
    }

}

window.addEventListener( "keydown", keyPressedDOWN, true);
window.addEventListener( "keyup", keyPressedUP, true);

function keyPressedDOWN(event) {
    var key = event.key;
    Input[key] = true;
}
function keyPressedUP(event) {
    var key = event.key;
    Input[key] = false;
}

function hasCollidedSquare(objA, clsstype)
{
    var collision = false;
    for(var i = 0; i < entityList.length; i++)
    {
        if(entityList[i] instanceof clsstype)
        {
            if(objA.x < entityList[i].x + entityList[i].scaleX &&
                objA.x + objA.scaleX > entityList[i].x &&
                objA.y < entityList[i].y + entityList[i].scaleY &&
                objA.y + objA.scaleY > entityList[i].y)
            {
                collision = true;
            }
        }
    }
    return collision;
}

function hasCollidedCircle(objA, clsstype)
{
    var radius = objA.radius;

    var collision = false;
    for(var i = 0; i < entityList.length; i++)
    {
        if(entityList[i] instanceof clsstype)
        {
            disX = objA.x - entityList[i].x;
            disY = objA.y - entityList[i].y;
            distance = Math.sqrt(disX * disX + disY * disY);

            if(radius >= distance - entityList[i].radius)
            {
                collision = true;
            }
        }
    }
    return collision;
}

//Applies player name and 'starts' the game
function run() {

    name = document.getElementById("name").value === "" ? "nameless fool" : document.getElementById("name").value;
    document.getElementById("enter_name").remove();

    canvas = document.createElement("canvas");
    canvas.id = "canvas";
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context = canvas.getContext('2d');

    socket.emit('request_orbdata', 'requesting orb data');

    start();
    MainLoop();
}