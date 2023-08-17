import { Bezier, utils } from "bezier-js";
import type { BBox, Point } from "bezier-js";

function loadImage(url: string): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise((res) => {
        img.addEventListener("load", res.bind(null, img));
        img.src = url;
    });
}

function is_out_range(x: number, y: number, box: BBox): boolean {
    const rang_x = box.x;
    const rang_y = box.y;
    return x < rang_x.min || x > rang_x.max || y < rang_y.min || y > rang_y.max;
}

function is_out_range_by_box(x: number, y: number, box: BBox): boolean {
    const rang_x = box.x;
    const rang_y = box.y;
    return x < rang_x.min || x > rang_x.max || y < rang_y.min || y > rang_y.max;
}

function interpolation(rate: number, start: number, end: number): number {
    return Math.round((1 - rate) * start + rate * end);
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
