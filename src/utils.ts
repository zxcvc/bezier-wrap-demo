import { Bezier, utils } from "bezier-js";
import type { BBox, Point } from "bezier-js";

function loadImage(url: string): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise((res) => {
        img.addEventListener("load", res.bind(null, img));
        img.src = url;
    });
}

function is_out_range(x: number, y: number, start_x: number, end_x: number, start_y: number, end_y: number): boolean {
    return x < start_x || x > end_x || y < start_y || y > end_y;
}

function is_out_range_by_box(x: number, y: number, box: BBox): boolean {
    const rang_x = box.x;
    const rang_y = box.y;
    return x < rang_x.min || x > rang_x.max || y < rang_y.min || y > rang_y.max;
}

function interpolation(rate: number, start: Point, end: Point): Point {
    const x = Math.round((1 - rate) * start.x + rate * end.x);
    const y = Math.round((1 - rate) * start.y + rate * end.y);
    return { x, y };
}

function createBezier(points: Array<Point>) {
    const res = [];
    const length = points.length;
    let i = 0;
    while (i < 4) {
        let k = i * 3;
        let j = 0;
        const arr = [];
        while (j < 4) {
            console.log(k + j);
            arr.push(points[(k + j) % length]);
            ++j;
        }
        if (i >= 2) {
            arr.reverse();
        }
        res.push(new Bezier(arr));
        ++i;
    }
    return res;
}

export { loadImage, is_out_range, interpolation, createBezier };
