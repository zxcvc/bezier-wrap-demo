import * as THREE from "three";
import { pointHandler } from "../utils.ts";
const width = 1048;
const height = 1200;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20, width / height, 10, 20000);
camera.up.set(0, 1, 0);
camera.position.set(0, 0, 10000);
camera.lookAt(0, 0, 0);

const pint = [
    { x: 446.0, y: -47.0 },
    { x: 674.3, y: 60.0 },
    { x: 880.6, y: 157.0 },
    { x: 1060.5, y: 239.5 },
    { x: 925.1, y: 540.3 },
    { x: 797.5, y: 825.4 },
    { x: 625.0, y: 1209.0 },
    { x: 427.1, y: 1098.0 },
    { x: 231.3, y: 1004.0 },
    { x: -3.0, y: 931.0 },
    { x: 150.5, y: 603.4 },
    { x: 300.5, y: 274.0 },
];
const points = pointHandler(pint);
const [top_bezier, right_bezier, bottom_bezier, left_bezier] = points.map(
    (item) => new THREE.CubicBezierCurve(...item.map((it) => new THREE.Vector2(it.x, -it.y)))
);
const top_points = top_bezier.getPoints(width - 1);
const right_points = right_bezier.getPoints(height - 1);
const bottom_points = bottom_bezier.getPoints(width - 1);
const left_points = left_bezier.getPoints(height - 1);
const bezier_box = new THREE.BufferGeometry().setFromPoints([
    ...top_points,
    ...right_points,
    ...bottom_points,
    ...left_points,
    // ...[new THREE.Vector2(100, 100), new THREE.Vector2(200, 200)],
]);

const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
const line = new THREE.Line(bezier_box, material);
scene.add(line);

renderer.render(scene, camera);

// {
//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     document.body.appendChild(renderer.domElement);

//     const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
//     camera.position.set(0, 0, 100);
//     camera.lookAt(0, 0, 0);

//     const scene = new THREE.Scene();
//     const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
//     const points = [];
//     points.push(new THREE.Vector3(-10, 0, 0));
//     points.push(new THREE.Vector3(0, 10, 0));
//     points.push(new THREE.Vector3(10, 0, 0));

//     const geometry = new THREE.BufferGeometry().setFromPoints(points);
//     const line = new THREE.Line(geometry, material);
//     scene.add(line);
//     renderer.render(scene, camera);
// }
