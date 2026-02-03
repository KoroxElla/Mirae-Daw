import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js";
import { Animator } from "./Animator.js";
import { MapperTranslator } from "../emotion_animation/mapperTranslator.js";


console.log("🔥 main.js running");

/* =========================
   SCENE SETUP
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

/* =========================
   LIGHTING
========================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(1, 2, 3);
scene.add(keyLight);

/* =========================
   ANIMATOR
========================= */
const animator = new Animator();

/* =========================
   LOAD AVATAR
========================= */
const loader = new GLTFLoader();

loader.load("./testavatar.glb", (gltf) => {
  const avatar = gltf.scene;
  scene.add(avatar);
  scene.add(new THREE.AxesHelper(2));

  avatar.scale.set(1.2, 1.2, 1.2);

  // Center avatar automatically
  const box = new THREE.Box3().setFromObject(avatar);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  avatar.position.sub(center);

  avatar.position.y += size.y/2;
  avatar.rotation.y = Math.PI;

  // Camera positioning (NOW size exists)
  camera.position.set(0, size.y * 0.8, size.z * 2.5);
  controls.target.set(0, size.y * 0.5, 0);
  controls.update();


  animator.bindAvatar(avatar);
  const translator = new MapperTranslator({
    bones: animator.bones
  });

/* =========================
   SIMULATED AI OUTPUT
   (pretend this came from Python)
========================= */

const emotionWeights = {
  sadness: 0.8,
  anxiety: 0.2
};

/* =========================
   TRANSLATE + APPLY
========================= */

const instructions = translator.translateMultiple(emotionWeights);

animator.applyInstructions(instructions);



});

/* =========================
   LOOP
========================= */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  animator.update(clock.getDelta());
  renderer.render(scene, camera);
}
animate();

/* =========================
   RESIZE
========================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

