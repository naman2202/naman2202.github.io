var canvas = document.getElementById("canvas");
// $(canvas).css({"height": "275px", "width": "548px"});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext("2d");

var colors = ["#688990", "#7C6241", "#182A61", "#4E1D0E", "#CEAB4E"];
var blacks = ["#000000", "#555555", "gray", "purple"];
var whites = ["eeeeee", "#ffffff", "#aaaaaa", "rgb(255, 200, 200)", "rgb(200,200,250)"];
const numParticles = 1;
const numCelestials = 200;
var randDirection = [-1, 1];
var planets = [];
var blackHoles = [];
var celestials = [];
var flash = 0;

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
  
  for(z=0;z<celestials.length;z++) {
    celestials[z].draw();
  }  
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
  
  this.draw = function(){
    c.beginPath();
    c.ellipse(this.x, this.y, this.radiusX, this.radiusY, this.rotation*Math.PI, 0, 2*Math.PI);
    c.fillStyle = this.color;
    c.strokeStyle = randomBlackColor();
    c.stroke();
    c.fill();
  }
}

function BlackHole(x, y) {
  this.x = x;
  this.y = y;
  
  this.draw = function(){
    c.beginPath();
    c.arc(this.x, this.y, getRandomIntFromRange(25, 50), 0, 2*Math.PI);
    c.fillStyle = randomBlackColor();
    c.stroke();
    c.fill();
  }
}

function Particle(radius, mass) {
  this.x = (Math.random() * (canvas.width - 2*radius) + radius);
  this.y = (Math.random() * (canvas.height - 2*radius) + radius);  
  this.radius = getRandomIntFromRange(20, 40);
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
    holeIndex = closestBlackHole(this);
    nextX(this, holeIndex);
    nextY(this, holeIndex);    
    if ((holeIndex != -1)&&((Math.abs(blackHoles[holeIndex].x - this.x)) <= this.radius)&&((Math.abs(blackHoles[holeIndex].y - this.y)) <= this.radius)) {
      if (this.radius < 1) {
       this.radius = 1; 
      }
      else {
       this.radius -=1; 
      }      
    }
    else if (this.radius > this.minRadius) {
      this.radius -= 1;
    }
    this.draw();
  }
}

function nextX(p, holeIndex){
  if (holeIndex != -1) {
      // distance = distance(parr[z].x, parr[z].y, mouse.x, mouse.y);
      if (p.x > blackHoles[holeIndex].x) {
        p.directionX = -1;        
      }
    
      else if (p.x <= blackHoles[holeIndex].x){
        p.directionX = 1;
      }
   }
  else {
    if ((p.x >= (canvas.width-p.radius))||(p.x <= p.radius)) {
      p.directionX = -p.directionX;
    }      
    }
  p.x = p.x + (p.directionX*p.speedX);     
}

function nextY(p, holeIndex){
  if (holeIndex != -1) {
      // distance = distance(parr[z].x, parr[z].y, mouse.x, mouse.y);
      if (p.y > blackHoles[holeIndex].y) {
        p.directionY = -1;        
      }
      else if (p.y <= blackHoles[holeIndex].y){
        p.directionY = 1;
      }
      // p.speedY = Math.sqrt(p.speedY^2 - 2*0.0001*Math.abs(p.y - mouse.y));
   }
  else {
    if ((p.y >= (canvas.height-p.radius))||(p.y <= p.radius)) {    
      p.directionY = -p.directionY;
    }      
  }
  p.y = p.y + (p.directionY*p.speedY);  
}

function closestBlackHole(obj) {
  	var minDist=10000;
    var dist = 10000;    
  	if (blackHoles.length > 0) {
  		var holeIndex = 0;  		
  		for(var i=0;i < blackHoles.length;i++) {
      		dist = distance(obj.x, obj.y, blackHoles[i].x, blackHoles[i].y);
      		if (dist <= minDist) {
        		minDist = dist;
        		holeIndex = i;
      		}
    	}
  	}
  	else {
  		var holeIndex = -1;
  	}        
    
    // console.log(minDist);
    return holeIndex;    
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
  // if (blackHoles.length > 0) {
  	// flash = 100;
  	blackHoles = [];
  // }
  
});

function distance(x1, y1, x2, y2) {
  return (Math.sqrt((x2-x1)^2 + (y2-y1)^2));
}

function getRandomIntFromRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.random()*(max-min+1);
}