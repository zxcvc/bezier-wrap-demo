import * as THREE from "three";
import { Mesh, type WebGLRenderer } from "three";
import type { Point } from "bezier-js";
import { pointHandler } from "./utils";

// const my_renderer = new THREE.WebGLRenderer();

async function fn(width: number, height: number, img_url: string, bezier_points: Array<Point>): Promise<string> {
    const renderer = new THREE.WebGLRenderer();
    renderer.clear();
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, width, 0, -height);
    camera.position.set(0, 0, 2);
    const points = pointHandler(bezier_points);

    let shape = new THREE.Shape();
    points.forEach((item) => {
        shape
            .moveTo(item[0].x, -item[0].y)
            .bezierCurveTo(item[1].x, -item[1].y, item[2].x, -item[2].y, item[3].x, -item[3].y);
    });
    return new Promise((res) => {
        new THREE.TextureLoader().load(img_url, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            // texture.wrapS = THREE.RepeatWrapping;
            // texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipMapNearestFilter;

            const geometry = new THREE.ShapeGeometry(shape, 7);
            const position = geometry.attributes.position.array;
            const material = new THREE.MeshBasicMaterial({ map: texture, wireframe: false });
            let uv = new Float32Array(position.length);
            const length_peer_b = position.length / 4;
            console.log(position);
            for (let s = 0; s < 4; ++s) {
                let start = s * length_peer_b;
                for (let i = 0; i + 2 < length_peer_b; i += 3) {
                    let x, y, z;

                    switch (s) {
                        case 0: {
                            x = i / length_peer_b;
                            y = 1;
                            z = 0;
                            uv[i + start] = x;
                            uv[i + start + 1] = y;
                            uv[i + start + 2] = z;
                            break;
                        }
                        case 1: {
                            x = 1;
                            y = (length_peer_b - i) / length_peer_b;
                            z = 0;
                            uv[i + start] = x;
                            uv[i + start + 1] = y;
                            uv[i + start + 2] = z;
                            break;
                        }
                        case 2: {
                            x = (length_peer_b - i) / length_peer_b;
                            y = 0;
                            z = 0;
                            uv[i + start] = x;
                            uv[i + start + 1] = y;
                            uv[i + start + 2] = z;
                            break;
                        }
                        case 3: {
                            x = 0;
                            y = i / length_peer_b;
                            z = 0;
                            uv[i + start] = x;
                            uv[i + start + 1] = y;
                            uv[i + start + 2] = z;
                            break;
                        }
                    }
                    console.log(x, y);
                }
            }
            geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 3));
            const mesh = new Mesh(geometry, material);
            scene.add(mesh);
            renderer.render(scene, camera);
            res(renderer.domElement.toDataURL());
        });
    });
}
console.time("1");
const width = 1048;
const height = 1200;
const img_url = "/6.webp";
const bezier_points = [
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
const b1 = [
    { x: 269.0, y: -1.3 },
    { x: 206.7, y: 1.3 },
    { x: 141.8, y: 14.3 },
    { x: 90.8, y: 45.3 },
    { x: 107.0, y: 318.0 },
    { x: 115.0, y: 584.9 },
    { x: -6.5, y: 893.5 },
    { x: 21.8, y: 930.5 },
    { x: 74.2, y: 949.0 },
    { x: 122.5, y: 955.5 },
    { x: 347.0, y: 647.9 },
    { x: 289.5, y: 304.5 },
];
const b2 = [
    { x: 16.3, y: 0.3 },
    { x: 79.6, y: 0.5 },
    { x: 145.6, y: 18.0 },
    { x: 196.8, y: 42.0 },
    { x: 172.5, y: 321.8 },
    { x: 186.0, y: 583.6 },
    { x: 294.0, y: 886.5 },
    { x: 266.1, y: 925.0 },
    { x: 213.3, y: 944.5 },
    { x: 149.0, y: 943.5 },
    { x: -45.0, y: 641.6 },
    { x: -6.0, y: 309.3 },
];
// const url = await fn(width, height, img_url, bezier_points);
const url = await fn(283, 943, "/7.jpg", b1);
const img = document.createElement("img");
img.src = url;
document.body.append(img);
console.timeEnd("1");

export default fn;
