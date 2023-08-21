/* eslint-disable */
import { Bezier, Point, Projection } from "bezier-js";
// import {} from "matrix-js";
import { loadImage, is_out_range, interpolation, createBezier } from "./utils";

async function fn(img_url: string, width: number, height: number, bezier_point: Array<Point>) {
    const [top_bezier, right_bezier, bottom_bezier, left_bezier] = createBezier(bezier_point);
    for (let i = 0; i < 1; i += 0.01) {
        // console.log(top_bezier.compute(i));
    }
    const img = await loadImage(img_url);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas?.getContext("2d");
    ctx?.drawImage(img, 0, 0, width, height);

    let origin_imgdata = ctx?.getImageData(0, 0, width, height)!;
    const channels = origin_imgdata.data.length / (width * height);
    const target_imagedata = new ImageData(width, height);

    const top_arr: Array<Point> = top_bezier.getLUT(width);
    const bottom_arr: Array<Point> = bottom_bezier.getLUT(width);
    const left_arr: Array<Point> = left_bezier.getLUT(height);
    const right_arr: Array<Point> = right_bezier.getLUT(height);

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const px = new Uint8Array([0, 0, 0, 255]);
            const top_point = top_arr[x];
            const bottom_point = bottom_arr[x];
            const left_point = left_arr[y];
            const right_point = right_arr[y];

            const target1 = { x: Math.round(left_point.x + top_point.x), y: Math.round(left_point.y + top_point.y) };
            const target2 = {
                x: Math.round(right_point.x + bottom_point.x),
                y: Math.round(right_point.y + bottom_point.y),
            };
            const target = interpolation(x / width, target1, target2);
            const target_x = interpolation(x / width, left_point, right_point);
            const target_y = interpolation(y / height, top_point, bottom_point);
            // const target = { x: target_x.x + target_y.x, y: target_x.y + target_y.y };
            // console.log(target.x, target.y);
            if (!is_out_range(target.x, target.y, left_point.x, right_point.x, top_point.y, bottom_point.y)) {
                for (let i = 0; i < channels; ++i) {
                    px[i] = origin_imgdata.data[y * width * channels + x * channels + i];
                }
            }

            // console.log(px);
            for (let i = 0; i < channels; ++i) {
                target_imagedata.data[target.y * width * channels + target.x * channels + i] = px[i];
            }
            // console.log(target.y * width * channels + target.x);
        }
    }
    console.log(target_imagedata);

    ctx?.clearRect(0, 0, width, height);
    ctx?.putImageData(target_imagedata, 0, 0);
    return canvas.toDataURL();
}

export default fn;

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

const url = await fn("/6.webp", 1048, 1200, pint);
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const ctx = canvas.getContext("2d");
const img = await loadImage(url);
canvas.width = img.width;
canvas.height = img.height;
ctx?.drawImage(img, 0, 0);
