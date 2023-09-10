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
    // rate = Math.max(0,rate)
    const x = Math.round((1 - rate) * start.x + rate * end.x);
    const y = Math.round((1 - rate) * start.y + rate * end.y);

    return { x, y };
}
function interpolation_number(rate: number, start: number, end: number): number {
    return (1 - rate) * start + rate * end;
}

function double_itnerpllation_point(rx: number, ry: number, A: Point, B: Point, C: Point, D: Point): Point {
    const res_rx = 1 - rx;
    const res_ry = 1 - ry;
    const x = res_rx * res_ry * A.x + rx * res_ry * B.x + rx * ry * C.x + res_rx * ry * D.x;
    const y = res_rx * res_ry * A.y + rx * res_ry * B.y + rx * ry * C.y + res_rx * ry * D.y;

    return {
        x: Math.round(x),
        y: Math.round(y),
    };
}

// 定义高斯函数作为径向基函数
function gaussian(r: number): number {
    const sigma = 1; // 高斯函数的标准差
    return Math.exp(-(r ** 2) / (2 * sigma ** 2));
}
function linear(r: number): number {
    return Math.max(0, 1 - r);
}
function thinPlateSpline(r: number): number {
    return r === 0 ? 0 : r ** 2 * Math.log(r);
}
function multiquadricWithTension(r: number, tension: number = 0.1): number {
    return Math.sqrt(1 + (tension * r) ** 2);
}
function polynomial(r: number, degree: number = 0): number {
    return Math.pow(r, degree);
}
function morletWavelet(r: number): number {
    return Math.cos(r) * Math.exp(-(r ** 2) / 2);
}
function shepard(r: number, power: number = 1): number {
    return 1 / Math.pow(r, power);
}
// 定义径向基函数插值函数
function radialBasisFunctionInterpolation(
    targetPoint: { x: number; y: number },
    knownPoints: { x: number; y: number; value: number }[]
): number {
    // 计算目标点与已知点之间的距离
    const distances = knownPoints.map((point) =>
        Math.sqrt((point.x - targetPoint.x) ** 2 + (point.y - targetPoint.y) ** 2)
    );

    // 计算权重
    const weights = distances.map((distance) => shepard(distance));

    // 计算插值结果
    const interpolatedValue =
        weights.reduce((sum, weight, index) => {
            return sum + weight * knownPoints[index].value;
        }, 0) / weights.reduce((sum, weight) => sum + weight, 0);

    return interpolatedValue;
}
// function interpllation_line(rate:number,start:Line,end:Line):Line{
// }

function pointHandler(points: Array<Point>, reverse: boolean = true): Array<Array<Point>> {
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
        if (i >= 2 && reverse) {
            arr.reverse();
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
    for (let i = 0; i <= n; ++i) {
        const len = i * setp_length;
        const t = binary_search(generator, len, 0, 1, ERROR_MARGIN);
        ans[i] = bezier.compute(t);
    }
    console.log();
    return ans;
}

function get_point_by_length_rate(t: number, bezier: Bezier): Point {
    const length = bezier.length();
    const len = length * t;
    const generator = gs_length.bind(null, bezier);
    const _t = binary_search(generator, len, 0, 1, ERROR_MARGIN);
    return bezier.compute(_t);
}

class Line {
    start: Point;
    end: Point;
    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }
}

function get_cross_point(line_a: Line, line_b: Line): Point {
    const A1 = line_a.start;
    const A2 = line_a.end;
    const B1 = line_b.start;
    const B2 = line_b.end;
    const x =
        ((A1.x * A2.y - A1.y * A2.x) * (B1.x - B2.x) - (A1.x - A2.x) * (B1.x * B2.y - B1.y * B2.x)) /
        ((A1.x - A2.x) * (B1.y - B2.y) - (A1.y - A2.y) * (B1.x - B2.x));
    const y =
        ((A1.x * A2.y - A1.y * A2.x) * (B1.y - B2.y) - (A1.y - A2.y) * (B1.x * B2.y - B1.y * B2.x)) /
        ((A1.x - A2.x) * (B1.y - B2.y) - (A1.y - A2.y) * (B1.x - B2.x));
    return { x: Math.round(x), y: Math.round(y) };
}

function cross_point(A: Line, B: Line): Point {
    const x1 = A.start.x;
    const y1 = A.start.y;
    const x2 = A.end.x;
    const y2 = A.end.y;

    const x3 = B.start.x;
    const y3 = B.start.y;
    const x4 = B.end.x;
    const y4 = B.end.y;

    const m1 = (y2 - y1) / (x2 - x1);
    const m2 = (y4 - y3) / (x4 - x3);

    const b1 = y1 - m1 * x1;
    const b2 = y3 - m2 * x3;

    const x = (b2 - b1) / (m1 - m2);
    const y = m1 * x + b1;

    return { x, y };
}

function inverseDistanceWeighting(points: Point[], target_points: Point[], target: Point, power: number): Point {
    let weightSum = 0;
    let x = 0;
    let y = 0;
    for (let i = 0; i < points.length; ++i) {
        const point = points[i];
        const distance = Math.sqrt((point.x - target.x) ** 2 + (point.y - target.y) ** 2);
        const weight = Math.pow(1 / distance, power);
        x += weight * target_points[i].x;
        y += weight * target_points[i].y;
        weightSum += weight;
    }

    return {
        x: x / weightSum,
        y: y / weightSum,
    };
}

export {
    inverseDistanceWeighting,
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
    get_cross_point,
    cross_point,
    Line,
    double_itnerpllation_point,
    radialBasisFunctionInterpolation,
    get_point_by_length_rate,
};
