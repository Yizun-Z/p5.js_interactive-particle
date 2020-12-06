// SID 490054965   Name: Yizun Zhang
// Interaction with particle of images.
// -Use the controls on the screen  to change settings.
// -Move the mouse to interact with it.

// Particle part inspired by
// Image into Interactive Particles - HTML Canvas Animation Tutorial | Advanced Pure Vanilla JavaScript
// https://www.youtube.com/watch?v=afdHgwn1XCY
// by Frank's Laboratory

// Slider part inspired by
// 8.5: Interacting with the DOM using Sliders, Buttons and Text Inputs - p5.js Tutorial
// https://www.youtube.com/watch?v=587qclhguQg
// 8.6: Other Events and Inputs - p5.js Tutorial
// https://www.youtube.com/watch?v=HsDVz2_Qgow
// by The Coding Train

let newImage;
let myImage = [];
let nameArray = ["img1.jpg", "img2.jpg","img3.jpg","img4.jpg"];
let imageIndex = -1;
let particlesArray = [];
let PercentOfLoad = 0.05;
let enoughTarget = 50;
let speedSlider;
let mouseSizeSlider;
let particleSizeSlider;

function preload() {
  for (let i = 0; i < nameArray.length; i++) {
    newImage = loadImage(nameArray[i]);
    myImage.push(newImage);
  }
}

// Set up different controls 
function setup() {
  createCanvas(windowWidth, windowHeight);

  mouseSizeSlider = new SliderSetting("Mouse Size", 40, 160, 100, width * 0.05, height * 0.2);

  particleSizeSlider = new SliderSetting("Particle Size", 1, 20, 9, mouseSizeSlider.slider.position().x + width/3, height * 0.2);

  speedSlider = new SliderSetting("Speed", 0, 5, 1, particleSizeSlider.slider.position().x + width/3, height * 0.2 );

  // Create next image button 
  let nextButton = createButton("Next Image");
  nextButton.position(particleSizeSlider.slider.position().x + 30, height * 0.8);
  nextButton.mousePressed(nextImage);

  // Start with first image.
  nextImage();
}

function draw() {
  background(255);

  // Show all of particles
  for (let x = particlesArray.length - 1; x > -1; x--) {
    particlesArray[x].draw();
    particlesArray[x].move();
  }

  // Show all of sliders.
  mouseSizeSlider.show();
  particleSizeSlider.show();
  speedSlider.show();
}

class SliderSetting {
  constructor(name, minNum, maxNum, defaultNum, xpos, ypos) {
    this.name = name;
    this.slider = createSlider(minNum, maxNum, defaultNum);
    this.slider.position(xpos, ypos);
  }

  show() {
    let sliderPosition = this.slider.position();
    fill(0);
    noStroke();
    textSize(20);
    text(this.slider.value(), sliderPosition.x + this.slider.width + 20, sliderPosition.y + 12);
    text(this.name, sliderPosition.x, sliderPosition.y - 10);
  }
}

// Class of particle shows all of movements with its target.
class Particle {
  constructor(x, y) {
    this.velocity = new p5.Vector(0, 0);
    this.acceleration = new p5.Vector(0, 0);
    this.pp = new p5.Vector(x, y); //pp = partical position
    this.target = new p5.Vector(0, 0);
    this.forceMax = random(7, 14); // Its speed limit.
    this.speedMax = random(0.25, 2.25); // The speed of movement per frame.
    this.beginColor = color(0);
    this.endColor = color(0);
    this.blendRate = random(0.01, 0.05);
    this.beginSize = 0;
    this.DTT = 0; //DTT = Distance To Target.
  }

  // Particle's movement control function 
  move() {
    this.DTT = dist(this.pp.x, this.pp.y, this.target.x, this.target.y);
    let closeMult;

    // If the distance is close enough to target, then it will get slower. 
    if (this.DTT < enoughTarget) {
      closeMult = this.DTT / enoughTarget;
      this.velocity.mult(0.9);
    } else {
      closeMult = 1;
      this.velocity.mult(0.95);
    }

    // If the distance is far away from target, it will move toward target.
    if (this.DTT > 1) {
      let controller = new p5.Vector(this.target.x, this.target.y);
      controller.sub(this.pp);
      controller.normalize();
      controller.mult(this.speedMax * closeMult * speedSlider.slider.value());
      this.acceleration.add(controller);
    }

    // Interaction with mouse.

    let MD = dist(this.pp.x, this.pp.y, mouseX, mouseY);
    //MD = Mouse Distance from partical position

    if (MD < mouseSizeSlider.slider.value()) {
      // Push away from mouse.
      let push = new p5.Vector(this.pp.x, this.pp.y);
      push.sub(new p5.Vector(mouseX, mouseY));
      push.normalize();
      push.mult((mouseSizeSlider.slider.value() - MD) * 0.05);
      this.acceleration.add(push);
    }

    // Move arguments
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.forceMax * speedSlider.slider.value());
    this.pp.add(this.velocity);
    this.acceleration.mult(0);
  }

  // Particle's drawing function
  draw() {
    this.beginColor = lerpColor(this.beginColor, this.endColor, this.blendRate);
    stroke(this.beginColor);
    let targetSize = map(min(this.DTT, enoughTarget), enoughTarget, 0, 0, particleSizeSlider.slider.value());
    this.beginSize = lerp(this.beginSize, targetSize, 0.1);
    strokeWeight(this.beginSize);
    point(this.pp.x, this.pp.y);
  }
}

// Smoothly adds and removes particles to generate the next image.
function nextImage() {
  // Change the index to next image.
  imageIndex++;
  if (imageIndex > myImage.length - 1) {
    imageIndex = 0;
  }
  myImage[imageIndex].loadPixels();

  // Create an array for indexes based on particle array

  let indexArray = [];
  for (let i = 0; i < particlesArray.length; i++) {
    indexArray.push(i);
  }

  let pixel = 0;
  let particleNew;

  // Get each pixel in the image.
  for (let y = 0; y < myImage[imageIndex].height; y++) {
    for (let x = 0; x < myImage[imageIndex].width; x++) {
      // store the color of pixels
      let pixelr = myImage[imageIndex].pixels[pixel];
      let pixelg = myImage[imageIndex].pixels[pixel + 1];
      let pixelb = myImage[imageIndex].pixels[pixel + 2];
      let pixela = myImage[imageIndex].pixels[pixel + 3];
      pixel += 4;

      // little changce to assign a particle to this pixel.
      if (random(1.0) > PercentOfLoad) {
        continue;
      }

      let colorPixel = color(pixelr, pixelg, pixelb);

      if (indexArray.length > 0) {
        //If existing particle can be reused.
        let num = indexArray.splice(random(indexArray.length - 1), 1);
        particleNew = particlesArray[num];
      } else {
        // Otherwise create a new particle.
        particleNew = new Particle(width / 2, height / 2);
        particlesArray.push(particleNew);
      }

      particleNew.target.x = x + width / 2 - myImage[imageIndex].width / 2;
      particleNew.target.y = y + height / 2 - myImage[imageIndex].height / 2;
      particleNew.endColor = colorPixel;
    }
  }
}