import * as THREE from "three";
import { Mesh, type WebGLRenderer } from "three";
import type { Point } from "bezier-js";
import { pointHandler } from "./utils";

const my_renderer = new THREE.WebGLRenderer();

async function fn(
    width: number,
    height: number,
    img_url: string,
    bezier_points: Array<Point>,
    renderer: WebGLRenderer = my_renderer
): Promise<string> {
    // renderer.clear();
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

            const geometry = new THREE.ShapeGeometry(shape, 20);
            const position = geometry.attributes.position.array;
            const material = new THREE.MeshBasicMaterial({ map: texture, wireframe: false });
            let uv = new Float32Array(position.length);
            const length_peer_b = position.length / 4;
            console.log(length_peer_b);
            for (let s = 0; s < 4; ++s) {
                let start = s * length_peer_b;
                for (let i = 0; i + 2 < length_peer_b + 3; i += 3) {
                    let x, y, z;
                    switch (s) {
                        case 0: {
                            x = i / length_peer_b;
                            y = 1;
                            z = 0;
                            uv[i + start] = x;
                            uv[i + start + 1] = y;
                            uv[i + start + 2] = z;
                            console.log(x);
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
const url = await fn(width, height, img_url, bezier_points);
const img = document.createElement("img");
img.src = url;
document.body.append(img);
console.timeEnd("1");

export default fn;
