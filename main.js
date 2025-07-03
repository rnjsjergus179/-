/* ===============================
   0. 의존성 모듈 불러오기
   =============================== */
import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.13.2/+esm";

/* ===============================
   1. 기본 Three.js 세팅
   =============================== */
const canvas = document.getElementById("space");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 50);

/* 별빛 표현을 위한 환경 라이트 */
const ambient = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambient);

/* ===============================
   2. 천체(태양·지구·달) 생성
   =============================== */
const loader = new THREE.TextureLoader();
const textures = {
  sun: loader.load(
    "https://threejs.org/examples/textures/planets/sun.jpg"
  ),
  earth: loader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
  ),
  moon: loader.load(
    "https://threejs.org/examples/textures/planets/moon_1024.jpg"
  ),
};

const SUN_RADIUS = 10;
const EARTH_RADIUS = 4;
const MOON_RADIUS = 1.1;

const bodies = {};

/* 태양 */
bodies.sun = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS, 64, 64),
  new THREE.MeshBasicMaterial({ map: textures.sun })
);
bodies.sun.name = "sun";
scene.add(bodies.sun);

/* 지구 */
bodies.earth = new THREE.Mesh(
  new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
  new THREE.MeshStandardMaterial({ map: textures.earth })
);
bodies.earth.position.set(30, 0, 0);
bodies.earth.name = "earth";
scene.add(bodies.earth);

/* 달 */
bodies.moon = new THREE.Mesh(
  new THREE.SphereGeometry(MOON_RADIUS, 64, 64),
  new THREE.MeshStandardMaterial({ map: textures.moon })
);
bodies.moon.position.set(35, 0, 0);
bodies.moon.name = "moon";
scene.add(bodies.moon);

/* ===============================
   3. 카메라 & OrbitControls
   =============================== */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 500;
controls.minDistance = 2;

/* ===============================
   4. HUD: 시계·명령어 입력
   =============================== */
const clockEl = document.getElementById("clock");
const inputForm = document.getElementById("commandForm");
const inputEl = document.getElementById("commandInput");

/* 실시간 시계 업데이트 */
function updateClock() {
  const now = new Date();          // 클라이언트 PC 시각 (KST 환경)
  const formatted = now
    .toLocaleTimeString("ko-KR", { hour12: false })
    .padStart(8, "0");
  clockEl.textContent = formatted;
}
setInterval(updateClock, 1000); // 1초마다
updateClock();

/* 명령어 사전 정의 */
const COMMANDS = {
  earth: "earth",
  sun: "sun",
  moon: "moon",
};

/* 카메라 이동 함수 */
function flyTo(targetMesh) {
  const { x, y, z } = targetMesh.position;
  // 목표 위치에서 약간 떨어진 지점으로 카메라 애니메이션
  gsap.to(camera.position, {
    duration: 2,
    x: x + 8,
    y: y + 4,
    z: z + 8,
    ease: "power3.inOut",
    onUpdate: () => camera.lookAt(targetMesh.position),
  });
}

/* 입력 처리 */
inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cmd = inputEl.value.trim().toLowerCase();
  inputEl.value = ""; // 입력 초기화

  // 형식: "goto earth" or "move to earth" 등을 허용
  const matched = /(goto|move\s*to)\s+(earth|sun|moon)/.exec(cmd);
  if (matched) {
    const key = COMMANDS[matched[2]];
    flyTo(bodies[key]);
  }
});

/* ===============================
   5. 렌더 루프
   =============================== */
function animate() {
  requestAnimationFrame(animate);

  // 자전 효과
  bodies.sun.rotation.y += 0.0005;
  bodies.earth.rotation.y += 0.001;
  bodies.moon.rotation.y += 0.001;

  controls.update();
  renderer.render(scene, camera);
}
animate();

/* 창 크기 변경 대응 */
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
