/* eslint-disable */
import { Bezier, Point, Projection } from "bezier-js";
import {} from "matrix-js";
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

            const x_rate = x / width;
            const y_rate = y / height;
            const top_point = top_arr[Math.round(top_arr.length * x_rate)];
            const bottom_point = bottom_arr[Math.round(bottom_arr.length * x_rate)];
            const left_point = left_arr[Math.round(left_arr.length * y_rate)];
            const right_point = right_arr[Math.round(right_arr.length * y_rate)];

            let x_point = interpolation(x_rate, left_point, right_point);
            let y_point = interpolation(y_rate, top_point, bottom_point);
            const x1 = x_point.x;
            const x2 = x_point.y;
            const y1 = y_point.x;
            const y2 = y_point.y;

            const revet_martix = [
                [y2 / (x1 * y2 - x2 * y1), -x2 / (x1 * y2 - x2 * y1)],
                [-y1 / (x1 * y2 - x2 * y1), x1 / (x1 * y2 - x2 * y1)],
            ];

            const _origin_x = x_point.x + y_point.x;
            const _origin_y = x_point.y + y_point.y;
            const origin_x = Math.round(revet_martix[0][0] * _origin_x + revet_martix[0][1] * _origin_y);
            const origin_y = Math.round(revet_martix[1][0] * _origin_x + revet_martix[1][1] * _origin_y);

            if (
                !is_out_range(origin_x, origin_y, {
                    x: { min: 0, max: width },
                    y: { min: 0, max: height },
                })
            ) {
                for (let i = 0; i < channels; ++i) {
                    px[i] = origin_imgdata.data[origin_y * width * channels + origin_x * channels + i];
                }
            }

            for (let i = 0; i < channels; ++i) {
                target_imagedata.data[y * width * channels + x * channels + i] = px[i];
            }
        }
    }

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
