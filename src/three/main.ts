import * as THREE from "three";
import { Mesh } from "three";
import { LoadImageBySize, pointHandler } from "../utils.ts";
const width = 1048;
const height = 1200;
const img_url = "/6.webp";
console.time("1");
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, width, 0, -height, 0.1, 100000);
camera.position.set(0, 0, 10);
camera.up.set(0, 1, 0);
// camera.lookAt(0, 0, 0);

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

let shape = new THREE.Shape();
// points.forEach((item) => {
//     shape = shape
//         .moveTo(item[0].x, -item[0].y)
//         .bezierCurveTo(item[1].x, -item[1].y, item[2].x, -item[2].y, item[3].x, -item[3].y);
// });

shape.moveTo(-100, 100).lineTo(100, 100).lineTo(100, -100).lineTo(-100, -100).closePath();
const img = await LoadImageBySize(img_url, width, height);
console.log(img);
const texture = new THREE.TextureLoader().load(img, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;

    const geometry = new THREE.ExtrudeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
    renderer.render(scene, camera);
    console.timeEnd("1");
});
