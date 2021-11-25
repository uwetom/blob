import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Noise } from "noisejs";
import "./styles.css";
import { GUI } from "dat.gui";

let scene, camera, renderer;

let colour, intensity, light;
let ambientLight;
let sphere_geometry, material, sphere;
let orbit;

let sceneHeight, sceneWidth;

let clock, delta, interval;
let params;

let startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  // remove overlay
  let overlay = document.getElementById("overlay");
  overlay.remove();

  sceneWidth = window.innerWidth;
  sceneHeight = window.innerHeight;

  //create our clock and set interval at 30 fpx
  clock = new THREE.Clock();
  delta = 0;
  interval = 1 / 30;

  //create our scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfdfdf);
  //create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  //specify our renderer and add it to our document
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //create the orbit controls instance so we can use the mouse move around our scene
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableZoom = true;

  // lighting
  colour = 0xffffff;
  intensity = 1;
  light = new THREE.DirectionalLight(colour, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  sphere_geometry = new THREE.SphereGeometry(1, 100, 100);
  material = new THREE.MeshPhongMaterial({ color: 0x43ff93 });

  sphere = new THREE.Mesh(sphere_geometry, material);
  scene.add(sphere);
  window.addEventListener("resize", onWindowResize, false);
  params = { noiseAmt: 1 };
  const gui = new GUI();
  gui.add(params, "noiseAmt").min(0).max(10);
  play();
}

// stop animating (not currently used)
function stop() {
  renderer.setAnimationLoop(null);
}

// simple render function

function render() {
  renderer.render(scene, camera);
}

// start animating

function play() {
  //using the new setAnimationLoop method which means we are WebXR ready if need be
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

//our update function

function update() {
  orbit.update();
  //update stuff in here
  let time = clock.getElapsedTime();
  //console.log(time)
  let noise = new Noise();
  //go through vertices here and reposition them

  // change 'k' value for more spikes

  for (var i = 0; i < sphere.geometry.vertices.length; i++) {
    let p = sphere.geometry.vertices[i];
    p.normalize().multiplyScalar(
      1 +
        0.3 *
          noise.perlin3(
            p.x * params.noiseAmt + time,
            p.y * params.noiseAmt,
            p.z * params.noiseAmt
          )
    );
  }
  sphere.geometry.computeVertexNormals();
  sphere.geometry.normalsNeedUpdate = true;
  sphere.geometry.verticesNeedUpdate = true;
}

function onWindowResize() {
  //resize & align
  sceneHeight = window.innerHeight;
  sceneWidth = window.innerWidth;
  renderer.setSize(sceneWidth, sceneHeight);
  camera.aspect = sceneWidth / sceneHeight;
  camera.updateProjectionMatrix();
}
