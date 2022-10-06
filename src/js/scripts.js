import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10, 15, -22);

orbit.update();

const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false
    })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);
planeMesh.name = 'ground';

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true
    })
);
highlightMesh.rotateX(-Math.PI / 2);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh);

const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObject(planeMesh);
    if(intersects.length > 0) {
        const intersect = intersects[0];
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        const objectExist = objects.find(function(object) {
            return (object.position.x === highlightMesh.position.x)
            && (object.position.z === highlightMesh.position.z)
        });

        if(!objectExist)
            highlightMesh.material.color.setHex(0xFFFFFF);
        else
            highlightMesh.material.color.setHex(0xFF0000);
    }
});

const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 4, 2),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xFFEA00
    })
);

const objects = [];

window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        return (object.position.x === highlightMesh.position.x)
        && (object.position.z === highlightMesh.position.z)
    });

    if(!objectExist) {
        if(intersects.length > 0) {
            const sphereClone = sphereMesh.clone();
            sphereClone.position.copy(highlightMesh.position);
            scene.add(sphereClone);
            objects.push(sphereClone);
            highlightMesh.material.color.setHex(0xFF0000);
        }
    }
    console.log(scene.children.length);
});

function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);
    objects.forEach(function(object) {
        object.rotation.x = time / 1000;
        object.rotation.z = time / 1000;
        object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
    });
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});