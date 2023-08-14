import { Bezier } from "bezier-js";

import { loadImage, is_out_range, interpolation } from "./utils";
const CANVAS_ID = "#canvas";
const IMG_URL = "/4.jpg";

console.time("time");

const img = await loadImage(IMG_URL);
const width = img.naturalWidth;
const height = img.naturalHeight;

const cas = document.createElement("canvas");
cas.width = width;
cas.height = height;
const ctx = cas?.getContext("2d");
ctx?.drawImage(img, 0, 0);
const origin = ctx?.getImageData(0, 0, width, height)!;
const channels = origin.data.length / (width * height);
const target = new ImageData(width, height);

const top_bezier = new Bezier([
    { x: 0, y: 0 },
    { x: 0.33 * width, y: 100 },
    { x: 0.67 * width, y: 100 },
    { x: width, y: 0 },
]);
const bottom_bezier = new Bezier([
    { x: 0, y: height },
    { x: 0.33 * width, y: height - 100 },
    { x: 0.67 * width, y: height - 120 },
    { x: width, y: height },
]);
const left_bezier = new Bezier([
    { x: 0, y: 0 },
    { x: 200, y: 0.33 * height },
    { x: 200, y: 0.67 * height },
    { x: 0, y: height },
]);
const right_bezier = new Bezier([
    { x: width, y: 0 },
    { x: width - 100, y: 0.33 * height },
    { x: width - 200, y: 0.67 * height },
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

        const px = new Uint8Array(channels).fill(0);

        let x_rate = Math.abs(x - left) / Math.abs(right - left);
        let y_rate = Math.abs(y - top) / Math.abs(bottom - top);

        if (!is_out_range(x, y, left, right, top, bottom)) {
            let origin_x = interpolation(x_rate, 0, width);
            let origin_y = interpolation(y_rate, 0, height);
            for (let i = 0; i < channels; ++i) {
                px[i] = origin.data[origin_y * width * channels + origin_x * channels + i];
            }
        }
        for (let i = 0; i < channels; ++i) {
            target.data[y * width * channels + x * channels + i] = px[i];
        }
    }
}
console.timeEnd("time");
{
    const cas: HTMLCanvasElement = document.querySelector(CANVAS_ID)!;
    cas.width = width;
    cas.height = height;
    const ctx = cas?.getContext("2d");
    ctx?.putImageData(target, 0, 0);
}
