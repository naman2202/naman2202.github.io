var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext("2d");

var colors = ["#688990", "#7C6241", "#182A61", "#4E1D0E", "#CEAB4E"];
var blacks = ["#000000", "#333333", "#222222", "purple", "black", "black"];
var whites = ["eeeeee", "#ffffff", "#aaaaaa", "rgb(255, 200, 200)", "rgb(200,200,250)"];

const numParticles = 5;
const numCelestials = 100;

var randDirection = [-1, 1];
var planets = [];
var blackHoles = [];
var celestials = [];
var flash = 0;

var cometX = Math.random()*canvas.width;
var cometY = Math.random()*canvas.height;
var cometDx = getRandomIntFromRange(1,2);
var cometDy = getRandomIntFromRange(1,2);

function init() {
  for (z = 0; z < numParticles; z++) {
    var p = new Particle(15, 500);
    planets.push(p);
    p.draw();
  } 
}
init();

for (z = 0; z < numCelestials; z++) {
  celestials.push(new CelestialObject());
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0,0,canvas.width, canvas.height);
  
  c.fillStyle="#020202";
  c.fillRect(0,0,canvas.width, canvas.height);
  
  for(z=0; z<numCelestials; z++) {
    celestials[z].draw();
  }  

  if (cometX >= canvas.width) {
    cometX = 0;
  }

  if (cometY >= canvas.height) {
    cometY = 0;
  }

  cometX += 1;
  cometY += 1;
  c.beginPath();
  c.arc(cometX, cometY, 1, 0, 2*Math.PI);
  c.fillStyle = "#eee";
  c.stroke();
  c.fill();

  if (flash > 0) {
    flash = flash-10;
    c.beginPath();
    if ((flash/10)%2==0){
      color = "purple";
    }
    else {
      color = "rgb(255, 255, 190)";
    }
    c.fillStyle=color;
    c.fillRect(0,0,canvas.width, canvas.height);
    c.fill();
    if (flash < 20) {
      planets = []; 
      init();
    }    
    
  }
  for(z=0; z < planets.length; z++) {
   planets[z].update();
  }
  for(z=0; z < blackHoles.length; z++) {
   blackHoles[z].draw();
  }
  
}  
animate();

function randomColor() {  
    return colors[Math.floor(Math.random()*colors.length)];
}

function randomBlackColor() {
  return blacks[Math.floor(Math.random()*blacks.length)];
}

function randomWhiteColor() {
  return whites[Math.floor(Math.random()*whites.length)];
}

function CelestialObject() {
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * canvas.height;
  this.radiusX = getRandomIntFromRange(1, 2);
  this.radiusY = getRandomIntFromRange(1, 2);
  this.rotation = Math.random()*2;
  this.color = randomWhiteColor();
  this.twinkle = getRandomIntFromRange(0,1);
  this.moving = getRandomIntFromRange(0,1);
  
  this.draw = function(){
    c.beginPath();
    c.ellipse(this.x, this.y, this.radiusX, this.radiusY, this.rotation*Math.PI, 0, 2*Math.PI);
    c.fillStyle = this.color;
    if (this.twinkle == 1) {
      c.strokeStyle = randomBlackColor(); 
      c.stroke();
    }        
    c.fill();
  }
}

function BlackHole(x, y) {
  this.x = x;
  this.y = y;
  
  this.draw = function(){
    c.beginPath();
    c.arc(this.x, this.y, getRandomIntFromRange(10, 15), 0, 2*Math.PI);
    c.fillStyle = randomBlackColor();
    c.strokeStyle = randomBlackColor();
    c.stroke();
    c.fill();
  }
}

function Particle(radius, mass) {
  this.x = (Math.random() * (canvas.width - 2*radius) + radius);
  this.y = (Math.random() * (canvas.height - 2*radius) + radius);
  this.radius = getRandomIntFromRange(10, 30);
  this.minRadius = this.radius;
  this.mass = mass;
  this.color = colors[Math.floor(Math.random()*colors.length)];
  this.directionX = randDirection[Math.floor(Math.random()*randDirection.length)];
  this.directionY = randDirection[Math.floor(Math.random()*randDirection.length)];
  this.speedX = getRandomIntFromRange(1, 3);
  this.speedY = getRandomIntFromRange(1, 3);
  
  this.draw = function(){
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    c.fillStyle = this.color;
    c.strokeStyle=  this.color;
    c.stroke();
    c.fill();
  }  
  
  this.update = function() {
    hole = closestBlackHole(this);
    var holeIndex = hole.id;
    this.nextXY(hole);
    if ((holeIndex != -1)&&((hole.distance.absX) <= this.radius)&&(hole.distance.absY <= this.radius)) {
      if (this.radius > 10) {
        this.radius -= 1;
      }
      else {
        planets.splice(planets.indexOf(this), 1);
      }
    }
    this.draw();
  }

  this.nextXY = function(hole){
    var holeIndex = hole.id;
    var p = this;
    if (holeIndex != -1) {
      if (Math.floor(-hole.distance.x) > 0) {
        p.directionX = -1;
      }
      else if (Math.floor(-hole.distance.x) < 0) {
        p.directionX = 1;
      }
      
      if (Math.floor(-hole.distance.y) > 0) {
        p.directionY = -1;
      }
      else if (Math.floor(-hole.distance.y) < 0) {
        p.directionY = 1;
      }      

      // SAFE CODE FOR CONSTANT FORCE

      if (hole.distance.absX < hole.distance.absY) {
        p.speedY = Math.sqrt((p.speedY**2) + (150/hole.distance.absY));
        p.speedX = p.speedY*hole.distance.absX/hole.distance.absY;
      }
      else if (hole.distance.absX > hole.distance.absY) {
        p.speedX = Math.sqrt((p.speedX**2) + (150/hole.distance.absX));
        p.speedY = p.speedX*hole.distance.absY/hole.distance.absX;
      }
      else {
        p.speedY = Math.sqrt((p.speedY**2) + (150/hole.distance.absY));
        p.speedX = p.speedY;
      } 
      
      //SAFE CODE ENDS      
    }
    else {
      if ((p.x >= (canvas.width-p.radius))||(p.x <= p.radius)) {
        p.directionX = -p.directionX;
      }
      if ((p.y >= (canvas.height-p.radius))||(p.y <= p.radius)) {    
        p.directionY = -p.directionY;
      }
    }
    p.x = p.x + (p.directionX*p.speedX);
    p.y = p.y + (p.directionY*p.speedY);
  }

}

function closestBlackHole(obj) {
  	var minDist=10000;
    var dist = 10000;
    var hole = {id: -1, message: "No Black Hole Found!"}
  	
    for(i=0; i < blackHoles.length; i++) {
     	dist = distance(obj.x, obj.y, blackHoles[i].x, blackHoles[i].y);

     	if (dist <= minDist) {
        minDist = dist;
       	hole = {
          id: i,
          x: blackHoles[i].x,
          y: blackHoles[i].y,
          distance: {
            x: blackHoles[i].x - obj.x,
            y: blackHoles[i].y - obj.y,
            scalarDistance: minDist,
            absX: Math.abs(blackHoles[i].x - obj.x),
            absY: Math.abs(blackHoles[i].y - obj.y)
          }
        }
   	  }    
 	  }    
  return hole;    
}

window.addEventListener("click", function(event){
  var offsets = canvas.getBoundingClientRect();
  var x = event.x - offsets.left;
  var y = event.y - offsets.top;
  blackHoles.push(new BlackHole(x, y));
});

window.addEventListener("mouseout", function(event){
  // x = blackHoles[0].x;
  // y = blackHoles[0].y;
  if (blackHoles.length > 0) {
  	// flash = 100;
  	blackHoles = [];
  }
  
});

function distance(x1, y1, x2, y2) {
  return (Math.sqrt((x2-x1)**2 + (y2-y1)**2));
}

function getRandomIntFromRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.round(Math.random()*(max-min)+min);
}