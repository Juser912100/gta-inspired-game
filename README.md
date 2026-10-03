import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ea6a0);
scene.fog = new THREE.Fog(0x8ea6a0, 70, 260);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 18, 18);

const hemi = new THREE.HemisphereLight(0xdfeaf9, 0x2b4337, 1.5);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff0d1, 1.5);
sun.position.set(40, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
scene.add(sun);

const world = {
  width: 220,
  depth: 180,
};

const keys = {};
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();

const characterNameEl = document.getElementById('characterName');
const healthEl = document.getElementById('health');
const moneyEl = document.getElementById('money');
const modeEl = document.getElementById('mode');

const characters = [
  { id: 1, name: 'Michael', color: 0x7dc3ff, position: new THREE.Vector3(-12, 1.2, -10), speed: 18, health: 100, money: 0 },
  { id: 2, name: 'Franklin', color: 0x7ef5a3, position: new THREE.Vector3(0, 1.2, 5), speed: 20, health: 100, money: 0 },
  { id: 3, name: 'Trevor', color: 0xffaf6b, position: new THREE.Vector3(14, 1.2, -8), speed: 21, health: 100, money: 0 },
];

let activeCharacterIndex = 0;
let selectedVehicle = null;

function buildGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(world.width, world.depth),
    new THREE.MeshStandardMaterial({ color: 0x335d37, roughness: 0.95, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.9, metalness: 0.12 });

  const roads = [
    { x: 0, z: 0, w: world.width, d: 10 },
    { x: 0, z: 30, w: world.width, d: 10 },
    { x: 0, z: -30, w: world.width, d: 10 },
    { x: 0, z: 70, w: world.width, d: 10 },
    { x: -38, z: 0, w: 10, d: world.depth },
    { x: 0, z: 0, w: 10, d: world.depth },
    { x: 38, z: 0, w: 10, d: world.depth },
  ];

  roads.forEach((road) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(road.w, 0.3, road.d), roadMaterial);
    mesh.position.set(road.x, 0.15, road.z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  const laneMaterial = new THREE.MeshStandardMaterial({ color: 0xf3f1d2, emissive: 0x111111 });
  for (let z = -50; z <= 50; z += 18) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 7), laneMaterial);
    stripe.position.set(0, 0.32, z);
    scene.add(stripe);
  }

  for (let x = -60; x <= 60; x += 18) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(7, 0.05, 2.2), laneMaterial);
    stripe.position.set(x, 0.32, 0);
    scene.add(stripe);
  }
}

function makeWindowGrid(sizeX, sizeZ) {
  const windows = new THREE.Group();
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xf5d788, emissive: 0x77521f, emissiveIntensity: 0.8 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x171d22, emissive: 0x0a0d12 });

  const cols = Math.max(3, Math.floor(sizeX / 6));
  const rows = Math.max(3, Math.floor(sizeZ / 6));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 0.5), (row + col) % 3 === 0 ? windowMaterial : darkMaterial);
      win.position.set(-sizeX / 2 + 3 + col * 4.5, 2 + row * 4, 0.6);
      windows.add(win);
    }
  }

  return windows;
}

function buildCity() {
  const buildingData = [
    { x: -65, z: -55, w: 20, d: 18, h: 20 },
    { x: -40, z: -60, w: 18, d: 20, h: 18 },
    { x: 20, z: -58, w: 24, d: 18, h: 26 },
    { x: 55, z: -52, w: 18, d: 18, h: 18 },
    { x: -68, z: 42, w: 20, d: 22, h: 22 },
    { x: -25, z: 55, w: 22, d: 18, h: 18 },
    { x: 18, z: 52, w: 24, d: 20, h: 24 },
    { x: 63, z: 48, w: 20, d: 18, h: 20 },
    { x: -66, z: 10, w: 18, d: 18, h: 28 },
    { x: 60, z: 11, w: 18, d: 18, h: 26 },
  ];

  buildingData.forEach((b, index) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, b.h, b.d),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL((index / buildingData.length) * 0.14 + 0.56, 0.12, 0.52),
        roughness: 0.85,
        metalness: 0.18,
      })
    );
    mesh.position.set(b.x, b.h / 2, b.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const windows = makeWindowGrid(b.w, b.d);
    windows.position.set(b.x, 0, b.z);
    scene.add(windows);
  });
}

function createCharacterMesh(color) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.65 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3cda9, roughness: 1 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), bodyMat);
  torso.position.y = 1.4;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 24), skinMat);
  head.position.y = 2.9;
  head.castShadow = true;
  group.add(head);

  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.42), new THREE.MeshStandardMaterial({ color: 0x11151a }));
  legs.position.y = 0.45;
  legs.castShadow = true;
  group.add(legs);

  return group;
}

function createVehicleMesh(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.9, 1.6),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.4 })
  );
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.8, 1.3),
    new THREE.MeshStandardMaterial({ color: 0xeaf1f5, roughness: 0.35, metalness: 0.6 })
  );
  cab.position.set(0.2, 1.8, 0);
  cab.castShadow = true;
  group.add(cab);

  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const wheelOffsets = [
    [-1.1, 0.5, -0.9],
    [1.1, 0.5, -0.9],
    [-1.1, 0.5, 0.9],
    [1.1, 0.5, 0.9],
  ];

  wheelOffsets.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.35, 18), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  return group;
}

function createHeroMarker() {
  const marker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.2, 20),
    new THREE.MeshStandardMaterial({ color: 0xf9d367, emissive: 0x4b3a10, emissiveIntensity: 0.7 })
  );
  marker.position.y = 0.2;
  marker.castShadow = true;
  return marker;
}

const vehicle = createVehicleMesh(0xf0d76a);
vehicle.position.set(12, 0, 24);
scene.add(vehicle);

const activeMarker = createHeroMarker();
scene.add(activeMarker);

characters.forEach((character) => {
  const mesh = createCharacterMesh(character.color);
  mesh.position.copy(character.position);
  scene.add(mesh);
  character.mesh = mesh;
});

function updateHUD() {
  const active = characters[activeCharacterIndex];
  characterNameEl.textContent = active.name;
  healthEl.textContent = Math.round(active.health).toString();
  moneyEl.textContent = `$${active.money}`;
  modeEl.textContent = selectedVehicle ? 'In Vehicle' : 'On Foot';
}

function switchCharacter(index) {
  activeCharacterIndex = index;
  selectedVehicle = null;
  updateHUD();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isBlocked(x, z, radius = 1.2) {
  const buildingRects = [
    { x: -65, z: -55, w: 20, d: 18 },
    { x: -40, z: -60, w: 18, d: 20 },
    { x: 20, z: -58, w: 24, d: 18 },
    { x: 55, z: -52, w: 18, d: 18 },
    { x: -68, z: 42, w: 20, d: 22 },
    { x: -25, z: 55, w: 22, d: 18 },
    { x: 18, z: 52, w: 24, d: 20 },
    { x: 63, z: 48, w: 20, d: 18 },
    { x: -66, z: 10, w: 18, d: 18 },
    { x: 60, z: 11, w: 18, d: 18 },
  ];

  for (const b of buildingRects) {
    const dx = x - b.x;
    const dz = z - b.z;
    if (Math.abs(dx) < b.w / 2 + radius && Math.abs(dz) < b.d / 2 + radius) {
      return true;
    }
  }
  return false;
}

function tryVehicleEntry() {
  const active = characters[activeCharacterIndex];
  const dist = active.position.distanceTo(vehicle.position);

  if (selectedVehicle) {
    selectedVehicle = null;
    active.position.copy(new THREE.Vector3(vehicle.position.x + 3, 1.2, vehicle.position.z));
    active.position.x = clamp(active.position.x, -world.width / 2 + 2, world.width / 2 - 2);
    active.position.z = clamp(active.position.z, -world.depth / 2 + 2, world.depth / 2 - 2);
    return;
  }

  if (dist < 4) {
    selectedVehicle = vehicle;
    active.position.copy(vehicle.position);
  }
}

function updateCharacters(dt) {
  const active = characters[activeCharacterIndex];

  if (selectedVehicle) {
    let moveX = 0;
    let moveZ = 0;

    if (keys['w'] || keys['arrowup']) moveZ = -1;
    if (keys['s'] || keys['arrowdown']) moveZ = 1;
    if (keys['a'] || keys['arrowleft']) moveX = -1;
    if (keys['d'] || keys['arrowright']) moveX = 1;

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.hypot(moveX, moveZ) || 1;
      moveX /= length;
      moveZ /= length;

      const speed = 22;
      const nextX = vehicle.position.x + moveX * speed * dt;
      const nextZ = vehicle.position.z + moveZ * speed * dt;
      const safeX = clamp(nextX, -world.width / 2 + 4, world.width / 2 - 4);
      const safeZ = clamp(nextZ, -world.depth / 2 + 4, world.depth / 2 - 4);

      if (!isBlocked(safeX, safeZ, 2.5)) {
        vehicle.position.x = safeX;
        vehicle.position.z = safeZ;
      }
    }

    active.position.copy(vehicle.position);
    active.position.y = 1.2;
  } else {
    let moveX = 0;
    let moveZ = 0;

    if (keys['w'] || keys['arrowup']) moveZ = -1;
    if (keys['s'] || keys['arrowdown']) moveZ = 1;
    if (keys['a'] || keys['arrowleft']) moveX = -1;
    if (keys['d'] || keys['arrowright']) moveX = 1;

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.hypot(moveX, moveZ) || 1;
      moveX /= length;
      moveZ /= length;

      const nextX = active.position.x + moveX * active.speed * dt;
      const nextZ = active.position.z + moveZ * active.speed * dt;
      const safeX = clamp(nextX, -world.width / 2 + 2.5, world.width / 2 - 2.5);
      const safeZ = clamp(nextZ, -world.depth / 2 + 2.5, world.depth / 2 - 2.5);

      if (!isBlocked(safeX, safeZ, 1.8)) {
        active.position.x = safeX;
        active.position.z = safeZ;
      }
    }
  }

  characters.forEach((character) => {
    if (character !== active) {
      character.mesh.position.lerp(character.position, 0.12);
    }
  });

  active.mesh.position.lerp(active.position, 0.22);
  active.mesh.rotation.y = Math.atan2((vehicle.position.x - active.position.x), (vehicle.position.z - active.position.z)) || 0;
  activeMarker.position.copy(active.position);
  activeMarker.position.y = 0.2;
}

function updateCamera() {
  const active = characters[activeCharacterIndex];
  const target = selectedVehicle ? vehicle.position.clone() : active.position.clone();

  const desired = target.clone().add(new THREE.Vector3(0, 9, 12));
  camera.position.lerp(desired, 0.08);
  camera.lookAt(target.x, 1.5, target.z);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (key === '1') switchCharacter(0);
  if (key === '2') switchCharacter(1);
  if (key === '3') switchCharacter(2);

  if (key === 'e') {
    tryVehicleEntry();
  }
}

function handleKeyUp(event) {
  keys[event.key.toLowerCase()] = true;
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

buildGround();
buildCity();
updateHUD();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);

  updateCharacters(dt);
  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
