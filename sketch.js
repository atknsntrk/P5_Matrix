let buffer = [];
let serial;
let portName = 'COM3'
let bufferLength
let tilesX, tilesY, matrixWidth, matrixHeight, numChannels

let inc;
let scl;
let cols;
let rows;

let zoff;

let fr;

let particles = [];

let flowField = [];

function setup() {
  createCanvas(64, 64);
  background(0)
  tilesX = 1;
  tilesY = 1;
  matrixHeight = 64;
  matrixWidth = 64;
  numChannels = 3
  bufferLength = tilesX * matrixWidth * tilesY * matrixHeight * numChannels;
  // Assuming tex is a loaded image
  // You may replace this with your own image loading code
  let tex = loadImage('t.jpg');
  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('list', printList);  // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing
 
  serial.list();                      // list the serial ports
  serial.open(portName);              // open a serial port
  zoff = 0;
  scl = 10;
  inc = 0.1;
  cols = floor(width / scl);
  rows = floor(height / scl);
  fr = createP();

  for (let i = 0; i < 250; i++) {
    particles[i] = new Particle();
  }
  
  background(220);
}

function draw() {
  
  
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = (x + y * cols);
      let angle = noise(xoff, yoff, zoff) * TWO_PI;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowField[index] = v;
      xoff += inc;
      
    }
    yoff += inc;
    zoff += 0.0002;
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].edges();
    particles[i].show();    
    particles[i].follow(flowField);
  }

  loadPixels();
  let idx = 0;
  let id = 0
  for(let x = 0; x < matrixHeight; x++) {
    for(let y = 0; y < matrixWidth; y++) {
      buffer[id] = pixels[idx]
      id++;
      idx++;
      buffer[id] = pixels[idx]
      id++;
      idx++
      buffer[id] = pixels[idx]
      id++;
      idx++
      idx++
    }

  }
  
  serial.available()
  serial.clear()
  
  serial.write('*');     // The 'data' command
  serial.write(buffer);

}

function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + portList[i]);
  }
}

function extractPixelData(tex) {
  let idx = 0;
  for (let j = 0; j < NUM_TILES_Y; j++) {
    for (let i = 0; i < NUM_TILES_X; i++) {
      let c = tex.get(i * MATRIX_WIDTH, j * MATRIX_HEIGHT);
      
      // Extract red, green, and blue components
      let redComponent = (c >> 16 & 0xFF);
      let greenComponent = (c >> 8 & 0xFF);
      let blueComponent = (c & 0xFF);
      
      // Store components in the buffer array
      buffer.push(redComponent, greenComponent, blueComponent);
    }
  }
  
  // Assuming you have a function to send data over a serial connection
  sendData();
}

function sendData() {
  // Send the buffer data as needed, for example, over serial
  // Implement your code to send data here
}


function serverConnected() {
  console.log('connected to server.');
}
 
function portOpen() {
  console.log('the serial port opened.')
}
 
function serialEvent() {
 
}
 
function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}
 
function portClose() {
  console.log('The serial port closed.');
}


