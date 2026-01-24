import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js";
import { Animator } from "./Animator.js";

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
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.4, 0);
controls.enablePan = false;
controls.update();

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

loader.load("./avatar_wolf.glb", (gltf) => {
  const avatar = gltf.scene;
  scene.add(avatar);

  // Center avatar automatically
  const box = new THREE.Box3().setFromObject(avatar);
  const center = box.getCenter(new THREE.Vector3());
  avatar.position.sub(centre);
  avatar.rotation.y = Math.PI;

  animator.bindAvatar(avatar);

  // Initial test schema
  animator.applySchema({
    face: {
      eye_openness_left: 0.3,
      eye_openness_right: 0.22,
      brow_lower: 0.6
    },
    procedural: {
      eye_twitch: {
        side: "left",
        amplitude: 0.15,
        frequency: 6
      },
      blink: {
        rate: 0.25,
        duration: 0.12
      },
      breathing: {
        amplitude: 0.05,
        rate: 0.35
      }
    }
  });
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

