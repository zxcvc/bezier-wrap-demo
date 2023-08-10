import { Bezier } from "bezier-js";

import { loadImage, is_out_range, cz } from "./utils";
const CANVAS_ID = "#canvas";
const IMG_URL = "/4.jpg";

console.time("time");

const img = await loadImage(IMG_URL);
const width = img.naturalWidth;
const height = img.naturalHeight;
const channels = 4;

const cas = document.createElement("canvas");
cas.width = width;
cas.height = height;
const ctx = cas?.getContext("2d");
ctx?.drawImage(img, 0, 0);
const origin = ctx?.getImageData(0, 0, width, height)!;

const target = new ImageData(width, height);

const top_bezier = new Bezier([
    { x: 0, y: 0 },
    { x: 200, y: 200 },
    { x: 400, y: 200 },
    { x: width, y: 0 },
]);
const bottom_bezier = new Bezier([
    { x: 0, y: height },
    { x: 200, y: height - 100 },
    { x: 400, y: height - 200 },
    { x: width, y: height },
]);
const left_bezier = new Bezier([
    { x: 0, y: 0 },
    { x: 100, y: 200 },
    { x: 0, y: 400 },
    { x: 0, y: height },
]);
const right_bezier = new Bezier([
    { x: width, y: 0 },
    { x: width - 100, y: 200 },
    { x: width, y: 400 },
    { x: width, y: height },
]);

const top_arr = new Array(height);
const bottom_arr = new Array(height);
const left_arr = new Array(width);
const right_arr = new Array(width);

for (let i = 0; i < width; ++i) {
    const point_top = top_bezier.compute(i / width);
    const point_bottom = bottom_bezier.compute(i / width);
    top_arr[i] = point_top.y;
    bottom_arr[i] = point_bottom.y;
}
for (let i = 0; i < height; ++i) {
    const point_left = left_bezier.compute(i / height);
    const point_right = right_bezier.compute(i / height);
    left_arr[i] = point_left.x;
    right_arr[i] = point_right.x;
}

for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
        const top = top_arr[x];
        const bottom = bottom_arr[x];
        const left = left_arr[y];
        const right = right_arr[y];

        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        let x_rate = Math.abs(x - left) / Math.abs(right - left);
        let y_rate = Math.abs(y - top) / Math.abs(bottom - top);

        if (!is_out_range(x, y, left, right, top, bottom)) {
            let origin_x = cz(x_rate, 0, width);
            let origin_y = cz(y_rate, 0, height);
            r = origin.data[origin_y * width * channels + origin_x * channels];
            g = origin.data[origin_y * width * channels + origin_x * channels + 1];
            b = origin.data[origin_y * width * channels + origin_x * channels + 2];
            a = origin.data[origin_y * width * channels + origin_x * channels + 3];
        }

        target.data[y * width * channels + x * channels] = r;
        target.data[y * width * channels + x * channels + 1] = g;
        target.data[y * width * channels + x * channels + 2] = b;
        target.data[y * width * channels + x * channels + 3] = a;
    }
}
console.log(target);
console.timeEnd("time");
// cv.imshow(CANVAS_ID, target);
{
    const cas: HTMLCanvasElement = document.querySelector(CANVAS_ID)!;
    const ctx = cas?.getContext("2d");
    ctx?.putImageData(target, 0, 0);
}
