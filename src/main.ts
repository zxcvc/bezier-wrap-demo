import { Bezier } from "bezier-js";

import { loadImage, is_out_range, cz } from "./utils";
const CANVAS_ID = "canvas";
const IMG_URL = "/4.jpg";

const img = await loadImage(IMG_URL);

const utils = new Utils();
utils.loadOpenCv(() => {
    console.time("time");
    const origin = cv.imread(img);
    const channels = origin.channels();
    const width = origin.cols;
    const height = origin.rows;
    const target = new cv.Mat(height, width, origin.type());
    const offset_x = 0;
    const offset_y = 0;

    const bezier = new Bezier([
        { x: 100, y: 0 },
        { x: 200, y: 200 },
        { x: 400, y: 200 },
        { x: width, y: 0 },
    ]);
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const point = bezier.compute(x / width);

            let top_x = point.x;
            let top_y = point.y;

            let x_rate = (x - 0) / width;
            let y_rate = (y - top_y) / (height - top_y);

            let origin_x = Math.floor(x_rate * width);
            let origin_y = Math.floor(y_rate * height);

            origin_x = cz(x_rate, 0, width);
            origin_y = cz(y_rate, 0, height);

            let r = origin.ucharAt(origin_y, origin_x * channels);
            let g = origin.ucharAt(origin_y, origin_x * channels + 1);
            let b = origin.ucharAt(origin_y, origin_x * channels + 2);
            let a = origin.ucharAt(origin_y, origin_x * channels + 3);

            if (is_out_range(x, y, x, width, top_y, height)) {
                r = 0;
                g = 0;
                b = 0;
                a = 255;
            }
            target.data[y * width * channels + x * channels] = r;
            target.data[y * width * channels + x * channels + 1] = g;
            target.data[y * width * channels + x * channels + 2] = b;
            target.data[y * width * channels + x * channels + 3] = a;
        }
    }
    // console.log(target);
    console.timeEnd("time");
    cv.imshow(CANVAS_ID, target);
});
