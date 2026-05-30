import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020205, 0.015); 

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 8, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.target.set(0, 3, 0);

// የእድገት effect 
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2; // የሚበራው effect 
bloomPass.strength = 1.8;  // የብርሃን ነፀብራቅ
bloomPass.radius = 0.5;    // የብርሃን መፍካት

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// የጨለማ anime
const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
scene.add(ambientLight);

// የጠዋት ፀሀይ effect
const sunLight = new THREE.DirectionalLight(0xffaa55, 3.0);
sunLight.position.set(10, 5, -10);
scene.add(sunLight);

// ውስጣዊ ብርሃን
const innerGlow = new THREE.PointLight(0xff1144, 5.0, 10);
innerGlow.position.set(0, 4, 0);
scene.add(innerGlow);

// ጂኦሜትሪ
const roseGroup = new THREE.Group();
scene.add(roseGroup);
const petalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xcc0033,
    emissive: 0x440011,
    roughness: 0.6,
    metalness: 0.1,
    clearcoat: 0.1,
    clearcoatRoughness: 0.4,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95
});

// curved petal geometry
function createPetalGeometry(width, length, bend) {
    const geom = new THREE.PlaneGeometry(width, length, 16, 16);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const cup = Math.sin((x / width) * Math.PI) * bend;
        const bow = Math.pow(y / length, 2) * bend * 1.5;
        
        pos.setZ(i, cup + bow);
    }
    geom.computeVertexNormals();
    return geom;
}

const numPetals = 60;
const goldenAngle = 137.5 * (Math.PI / 180);
for (let i = 0; i < numPetals; i++) {
    const fraction = i / numPetals;
    const r = 0.5 + fraction * 2.5;
    const theta = i * goldenAngle; 
    const height = 3 + fraction * 1.5 - Math.pow(fraction, 2) * 3;
    const petalSizeW = 0.5 + fraction * 2.0;
    const petalSizeL = 1.0 + fraction * 3.0;
    const bend = 0.5 + fraction * 1.2;

    const petalGeom = createPetalGeometry(petalSizeW, petalSizeL, bend);
    const petalMesh = new THREE.Mesh(petalGeom, petalMaterial);
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    petalMesh.position.set(x, height, z);
    petalMesh.lookAt(0, height - 1, 0); 
    petalMesh.rotateX(Math.PI / 2 - fraction * 1.2); 
    petalMesh.rotateZ((Math.random() - 0.5) * 0.2);

    roseGroup.add(petalMesh);
}
const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a4314,
    roughness: 0.8
});

const stemPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -5, 0),
    new THREE.Vector3(0.5, -2, 0.2),
    new THREE.Vector3(-0.2, 1, -0.1),
    new THREE.Vector3(0, 3, 0)
]);

const stemGeom = new THREE.TubeGeometry(stemPath, 32, 0.15, 8, false);
const stemMesh = new THREE.Mesh(stemGeom, stemMaterial);
scene.add(stemMesh);
const particleCount = 400;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particlePhases = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    const index = i * 3;
    const radius = Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    particlePositions[index]     = radius * Math.cos(angle);
    particlePositions[index + 1] = (Math.random() * 10) - 5;
    particlePositions[index + 2] = radius * Math.sin(angle);
    particlePhases[i] = Math.random() * Math.PI * 2;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('phase', new THREE.BufferAttribute(particlePhases, 1));
const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xffbb44) }
    },
    vertexShader: `
        uniform float time;
        attribute float phase;
        varying float vAlpha;
        void main() {
            // Gentle floating up
            vec3 pos = position;
            pos.y += sin(time * 0.5 + phase) * 0.5;
            pos.x += cos(time * 0.3 + phase) * 0.2;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (10.0 / -mvPosition.z) * (sin(time * 2.0 + phase) * 0.5 + 0.5);
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = sin(time * 3.0 + phase) * 0.5 + 0.5;
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
            // Make them soft, glowing circles
            float dist = distance(gl_PointCoord, vec2(0.5));
            if(dist > 0.5) discard;
            float strength = (0.5 - dist) * 2.0;
            gl_FragColor = vec4(color, strength * vAlpha);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);
document.getElementById('loading').style.opacity = '0';
const clock = new THREE.Clock();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    particleMaterial.uniforms.time.value = time;
    innerGlow.intensity = 5.0 + Math.sin(time * 1.5) * 1.5;
    roseGroup.position.y = Math.sin(time * 0.5) * 0.2;
    stemMesh.position.y = Math.sin(time * 0.5) * 0.2;

    controls.update();
    composer.render();
}

animate();
