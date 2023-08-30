// import {} from "matrix-js";
import { loadImage, createBezier, getLUTByLen, is_out_by_points, interpolation_number, } from "./utils";
async function fn(img_url, width, height, bezier_point) {
    const [top_bezier, right_bezier, bottom_bezier, left_bezier] = createBezier(bezier_point);
    // const top_length = Math.floor(gs_length(top_bezier, 1));
    // const right_length = Math.floor(gs_length(right_bezier, 1));
    // const bottom_length = Math.floor(gs_length(bottom_bezier, 1));
    // const left_length = Math.floor(gs_length(left_bezier, 1));
    const top_points = getLUTByLen(top_bezier, width);
    const right_points = getLUTByLen(right_bezier, height);
    const bottom_points = getLUTByLen(bottom_bezier, width);
    const left_points = getLUTByLen(left_bezier, height);
    console.log(top_points, right_points, bottom_points, left_points);
    const img = await loadImage(img_url);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas?.getContext("2d");
    ctx?.drawImage(img, 0, 0, width, height);
    let origin_imgdata = ctx?.getImageData(0, 0, width, height);
    const channels = origin_imgdata.data.length / (width * height);
    const target_imagedata = new ImageData(width, height);
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const px = new Uint8Array([0, 0, 0, 255]);
            const top_point = top_points[x];
            const bottom_point = bottom_points[x];
            const left_point = left_points[y];
            const right_point = right_points[y];
            const x_rate = (x - left_point.x) / (right_point.x - left_point.x);
            const y_rate = (y - top_point.y) / (bottom_point.y - top_point.y);
            const origin_x = Math.round(interpolation_number(x_rate, 0, width));
            const origin_y = Math.round(interpolation_number(y_rate, 0, height));
            if (!is_out_by_points(x, y, width, height, [top_point, bottom_point, left_point, right_point])) {
                for (let i = 0; i < channels; ++i) {
                    px[i] = origin_imgdata.data[origin_y * width * channels + origin_x * channels + i];
                }
            }
            for (let i = 0; i < channels; ++i) {
                target_imagedata.data[y * width * channels + x * channels + i] = px[i];
            }
        }
    }
    console.log(target_imagedata);
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
const canvas = document.createElement("canvas");
document.body.append(canvas);
const ctx = canvas.getContext("2d");
const img = await loadImage(url);
canvas.width = img.width;
canvas.height = img.height;
ctx?.drawImage(img, 0, 0);
