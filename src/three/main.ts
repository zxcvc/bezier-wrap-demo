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
const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
camera.position.set(0, 0, 2);
const helper = new THREE.CameraHelper(camera);
helper.update();
scene.add(helper);

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
const [top, right, bottom, left] = pointHandler(pint);
const origin_x = width / 2;
const origin_y = height / 2;
const top_bezier = new THREE.CubicBezierCurve(
    ...top.map((item) => new THREE.Vector2((item.x - origin_x) / width, (item.y - origin_y) / -height))
);
const right_bezier = new THREE.CubicBezierCurve(
    ...right.map((item) => new THREE.Vector2((item.x - origin_x) / width, (item.y - origin_y) / -height))
);
const bottom_bezier = new THREE.CubicBezierCurve(
    ...bottom.map((item) => new THREE.Vector2((item.x - origin_x) / width, (item.y - origin_y) / -height))
);
const left_bezier = new THREE.CubicBezierCurve(
    ...left.map((item) => new THREE.Vector2((item.x - origin_x) / width, (item.y - origin_y) / -height))
);

const top_points = top_bezier.getPoints(width);
const right_points = right_bezier.getPoints(height);
const bottom_points = bottom_bezier.getPoints(width);
const left_points = left_bezier.getPoints(height);
const vertix = [...top_points, ...right_points, ...bottom_points.reverse(), ...left_points.reverse()];
const texture_top_points = top_points.flatMap((item) => [item.x, item.y]);
let shape = new THREE.Shape();
// points.forEach((item) => {
//     shape = shape
//         .moveTo(item[0].x, -item[0].y)
//         .bezierCurveTo(item[1].x, -item[1].y, item[2].x, -item[2].y, item[3].x, -item[3].y);
// });

const img = await LoadImageBySize(img_url, width, height);
const texture = new THREE.TextureLoader().load(img, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    const geometry = new THREE.BufferGeometry();
    geometry.face;
    const material = new THREE.MeshBasicMaterial({ map: texture, wireframe: true });
    const mesh = new Mesh(geometry, material);
    mesh.geometry.setFromPoints(vertix);
    const vertex = geometry.attributes.position.array;
    console.log(vertex);
    const uv = geometry.attributes.uv;
    console.log(uv);
    mesh.geometry.attributes.position.needsUpdate = true;
    scene.add(mesh);
    renderer.render(scene, camera);
    console.timeEnd("1");
});
