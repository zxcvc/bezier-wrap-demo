import { Bezier } from "bezier-js";
import type { BBox, Point } from "bezier-js";
const ERROR_MARGIN = 0.001;
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

function is_out_by_points(x: number, y: number, width: number, height: number, points: Array<Point>): boolean {
    let left = Number.MAX_SAFE_INTEGER;
    let right = Number.MIN_SAFE_INTEGER;
    let top = Number.MAX_SAFE_INTEGER;
    let bottom = Number.MIN_SAFE_INTEGER;
    points.forEach((point) => {
        left = Math.min(left, point.x);
        right = Math.max(right, point.x);
        top = Math.min(top, point.y);
        bottom = Math.max(bottom, point.y);
    });
    left = Math.max(0, left);
    right = Math.min(width, right);
    top = Math.max(0, top);
    bottom = Math.min(height, bottom);
    // console.log(left, right, top, bottom);
    return x < left || x > right || y < top || y > bottom;
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
function interpolation_number(rate: number, start: number, end: number): number {
    return (1 - rate) * start + rate * end;
}

function pointHandler(points: Array<Point>): Array<Array<Point>> {
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
            // arr.reverse();
        }
        res.push(arr);
        ++i;
    }
    return res;
}

function createBezier(points: Array<Point>) {
    const p = pointHandler(points);
    return p.map((item) => new Bezier(item));
}

async function LoadImageBySize(url: string, width: number, height: number): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const img = await loadImage(url);
    console.log(url);
    ctx?.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL();
}

function binary_search(
    generator: (...ary: any) => number,
    target: number,
    left: number,
    right: number,
    margin_error: number
) {
    while (left <= right) {
        let mid = (left + right) / 2;
        const ans = generator(mid);
        if (Math.abs(ans - target) <= margin_error) {
            return mid;
        } else if (ans < target) {
            left = mid;
        } else {
            right = mid;
        }
    }
    return left;
}

function length(bezier: Bezier, t: number) {
    const d = bezier.derivative(t);
    return Math.sqrt(d.x ** 2 + d.y ** 2);
}

function length_points(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function gs_length(bezier: Bezier, t: number) {
    return (
        (t / 2) *
        (length(bezier, ((t / 2) * -1) / Math.sqrt(3) + t / 2) + length(bezier, ((t / 2) * 1) / Math.sqrt(3) + t / 2))
    );
}

function getLUTByLen(bezier: Bezier, n: number): Array<Point> {
    const ans = new Array(n);
    const length = gs_length(bezier, 1);
    const setp_length = length / n;
    const generator = gs_length.bind(null, bezier);
    for (let i = 0; i < n; ++i) {
        const len = i * setp_length;
        const t = binary_search(generator, len, 0, 1, ERROR_MARGIN);
        ans[i] = bezier.compute(t);
    }
    return ans;
}

export {
    loadImage,
    is_out_range,
    is_out_range_by_box,
    interpolation,
    createBezier,
    pointHandler,
    LoadImageBySize,
    binary_search,
    gs_length,
    getLUTByLen,
    is_out_by_points,
    interpolation_number,
    length_points,
};
