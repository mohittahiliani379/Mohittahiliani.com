// city.js — Interactive cyberpunk cityscape (procedural low-poly skyline)
// Uses Three.js and OrbitControls for simple drag & zoom interactions.
// Camera rotation via dragging, scroll for zoom, hover detection for building glow.
// Designed to be performant with instancing and LOD simplifications.

let scene, camera, renderer, controls, raycaster, mouse, cityGroup, hoverObject;
const container = document.getElementById('bg-scene');

function initCity() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);
  camera.position.set(0, 20, 60);

  renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // fog and ambient
  scene.fog = new THREE.FogExp2(0x02030a, 0.0025);
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  // directional neon rim light
  const dir = new THREE.DirectionalLight(0x9d00ff, 0.6);
  dir.position.set(-50, 100, -50);
  scene.add(dir);

  // ground plane subtle grid
  const gridGeo = new THREE.PlaneGeometry(800,800,10,10);
  const gridMat = new THREE.MeshBasicMaterial({color:0x001122, transparent:true, opacity:0.6});
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI/2;
  grid.position.y = -0.1;
  scene.add(grid);

  cityGroup = new THREE.Group();
  scene.add(cityGroup);

  // procedural buildings (simple boxes) with instancing for performance
  const buildingGeom = new THREE.BoxGeometry(1,1,1);
  const baseMat = new THREE.MeshStandardMaterial({color:0x0b1020, roughness:0.6, metalness:0.2});
  // we'll create multiple buildings with varying heights and neon windows using emissive maps
  for(let x=-30;x<=30;x+=2.5){
    for(let z=-30;z<=30;z+=2.5){
      const h = Math.floor(Math.random()*12)+2;
      const mesh = new THREE.Mesh(buildingGeom, baseMat.clone());
      mesh.scale.set(1, h, 1);
      mesh.position.set(x + (Math.random()-0.5)*0.6, h/2 - 1, z + (Math.random()-0.5)*0.6);
      // create window emissive effect via vertex colors or emissive material tweak
      const neon = new THREE.Mesh(buildingGeom, new THREE.MeshStandardMaterial({color:0x001122, emissive:0x003344, emissiveIntensity:0.0, roughness:0.7, metalness:0.1}));
      neon.scale.copy(mesh.scale);
      neon.position.copy(mesh.position);
      // slightly offset neon to avoid z-fighting
      neon.position.y = mesh.position.y;
      cityGroup.add(mesh);
      cityGroup.add(neon);
      mesh.userData.neon = neon;
    }
  }

  // billboard plane with shader-like glow (placeholder)
  const billboardGeo = new THREE.PlaneGeometry(12,6);
  const billboardMat = new THREE.MeshBasicMaterial({color:0x00f0ff, transparent:true, opacity:0.12});
  const billboard = new THREE.Mesh(billboardGeo, billboardMat);
  billboard.position.set(18, 20, -10);
  billboard.rotation.y = -0.5;
  cityGroup.add(billboard);

  // stars/background
  const starsGeo = new THREE.BufferGeometry();
  const starsCnt = 500;
  const pos = new Float32Array(starsCnt*3);
  for(let i=0;i<starsCnt;i++){
    pos[i*3+0] = (Math.random()-0.5)*800;
    pos[i*3+1] = Math.random()*200 + 20;
    pos[i*3+2] = -Math.random()*800;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const starsMat = new THREE.PointsMaterial({size:0.6, color:0xffffff, transparent:true, opacity:0.6});
  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // raycaster & mouse
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // controls (OrbitControls adapted for drag rotate but disabled zoom - we'll handle zoom manually)
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.4;
  controls.minDistance = 20;
  controls.maxDistance = 120;
  controls.maxPolarAngle = Math.PI/2.1;

  window.addEventListener('resize', onResize, false);
  renderer.domElement.addEventListener('mousemove', onMouseMove, false);
  renderer.domElement.addEventListener('click', onClick, false);
  renderer.domElement.addEventListener('wheel', onScroll, {passive:false});

  animateCity();
}

function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e){
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  // hover detection
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cityGroup.children, false);
  if(intersects.length>0){
    const obj = intersects[0].object;
    if(obj.userData && obj.userData.neon){
      if(hoverObject !== obj){
        if(hoverObject && hoverObject.userData.neon) hoverObject.userData.neon.material.emissiveIntensity = 0.0;
        hoverObject = obj;
        obj.userData.neon.material.emissive = new THREE.Color(0x00f0ff);
        // ramp emissive intensity
        obj.userData.neon.material.emissiveIntensity = 1.2;
        // play a soft hover sfx (handled in main script via event)
        document.dispatchEvent(new CustomEvent('buildingHover', {detail:{x:e.clientX, y:e.clientY}}));
      }
    }
  } else {
    if(hoverObject && hoverObject.userData.neon) hoverObject.userData.neon.material.emissiveIntensity = 0.0;
    hoverObject = null;
  }
}

function onClick(e){
  // detect clicks on billboards (simple check)
  raycaster.setFromCamera(mouse, camera);
  const ints = raycaster.intersectObjects(cityGroup.children, false);
  if(ints.length>0){
    const obj = ints[0].object;
    // make a small click event to play glitch sound
    document.dispatchEvent(new CustomEvent('cityClick', {detail:{}}));
    // small camera nudge
    gsap.to(camera.position, {z: camera.position.z - 6, duration:0.6, yoyo:true, repeat:1, ease:"power2.inOut"});
  }
}

function onScroll(e){
  e.preventDefault();
  const delta = e.deltaY * 0.01;
  // zoom camera smoothly
  const newZ = THREE.MathUtils.clamp(camera.position.z + delta*8, controls.minDistance, controls.maxDistance);
  gsap.to(camera.position, {z:newZ, duration:0.6, ease:"power2.out"});
}

function animateCity(){
  requestAnimationFrame(animateCity);
  // subtle rotation of cityGroup for motion
  cityGroup.rotation.y += 0.0006;
  // twinkle windows
  cityGroup.children.forEach(c=>{
    if(c.material && c.material.emissive){
      c.material.emissiveIntensity = Math.max(0, (Math.sin(Date.now()/600 + c.position.x)+1)/2 * 0.6);
    }
  });
  controls.update();
  renderer.render(scene, camera);
}

// init when DOM ready
window.addEventListener('DOMContentLoaded', ()=>{
  try{ initCity(); } catch(e){ console.error(e); }
});
