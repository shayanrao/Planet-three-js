import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap';

const canvas = document.querySelector("#canvas");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

// Initialize clock to track elapsed time for animation
const clock = new THREE.Clock();

let lastWheelTime = 0;
let scrollCount = 0;
const throttleDelay = 2000;

window.addEventListener('wheel', (event) => {
    const currentTime = Date.now();

    if (currentTime - lastWheelTime >= throttleDelay) {
        lastWheelTime = currentTime;
        const direction = event.deltaY > 0 ? "down" : "up";
        scrollCount = (scrollCount + 1) % 4;

        const headings = document.querySelectorAll('.heading');
        gsap.to(headings, {
            duration: 1,
            y: direction === "down" ? `-=${100}%` : `+=${100}%`,
            ease: "power2.in-out",
        });

        gsap.to(sphereGroup.rotation, {
            y: "+=" + Math.PI / 2,
            duration: 1,
            ease: "expo.inOut",
        });

        if (scrollCount === 0) {
            gsap.to(headings, {
                duration: 1,
                y: `0`,
                ease: "power2.in-out",
            });
        }
    }
});

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const sphereGroup = new THREE.Group();
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const radius = 1.3;
const segment = 64;
const OrbitRadius = 4.5;
const textures = [
    './csilla/color.png',
    './earth/map.jpg',
    './venus/map.jpg',
    './volcanic/color.png',
];

const rgbeLoader = new RGBELoader();

const startTexture = new THREE.TextureLoader().load("./stars.jpg");
startTexture.colorSpace = THREE.SRGBColorSpace;
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial({
    map: startTexture,
    transparent: true,
    opacity: 0.8,
    side: THREE.BackSide,
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

const spheres = [];

rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/rogland_clear_night_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.encoding = THREE.LinearEncoding;

    scene.environment = texture.clone();

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
});

for (let i = 0; i < 4; i++) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textures[i]);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(radius, segment, segment);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
    });

    const sphere = new THREE.Mesh(geometry, material);
    spheres.push(sphere);

    const angle = (i / 4) * (Math.PI * 2);
    sphere.position.x = OrbitRadius * Math.cos(angle);
    sphere.position.z = OrbitRadius * Math.sin(angle);

    sphereGroup.add(sphere);
}

sphereGroup.rotation.x = 0.1;
sphereGroup.position.y = -0.8;

scene.add(sphereGroup);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    for (let i = 0; i < spheres.length; i++) {
        const sphere = spheres[i];
        sphere.rotation.y += delta * 0.1; 
    }

    renderer.render(scene, camera);
}

animate();

