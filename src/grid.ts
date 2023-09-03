import { matrix, det } from "mathjs";
import type { Point } from "bezier-js";
import {
    pointHandler,
    getLUTByLen,
    interpolation,
    interpolation_number,
    createBezier,
    LoadImageBySize,
    loadImage,
    get_cross_point,
    Line,
} from "./utils";

class Mesh {
    ctx: CanvasRenderingContext2D;
    borders: Array<Array<Point>> = [];
    grids: Array<VertexGrid> = [];
    constructor(
        ctx: CanvasRenderingContext2D,
        borders: Array<Array<Point>>,
        n: number,
        uv_width: number,
        uv_height: number
    ) {
        this.ctx = ctx;
        this.borders = borders;
        this.cteate_grid(this.borders, uv_width, uv_height);
    }

    create_border(width: number, height: number, n: number) {
        const setp_x = width / n;
        const setp_y = height / n;
        const top_border = [];
        const bottom_border = [];
        const left_border = [];
        const right_border = [];

        for (let i = 0; i < n + 1; ++i) {
            const x = setp_x * i;
            const y = setp_y * i;
            top_border.push({ x: x, y: 0 });
            bottom_border.push({ x: x, y: height });
            left_border.push({ x: 0, y: y });
            right_border.push({ x: width, y: y });
        }
        this.borders.push(top_border, right_border, bottom_border, left_border);
    }

    cteate_grid(borders: Array<Array<Point>>, uv_width: number, uv_height: number) {
        const grids: Array<VertexGrid> = [];
        const top_border = borders[0];
        const right_border = borders[1];
        const bottom_border = borders[2];
        const left_border = borders[3];
        const x_n = top_border.length;
        const y_n = right_border.length;
        for (let y = 0; y + 1 < y_n; ++y) {
            for (let x = 0; x + 1 < x_n; ++x) {
                const top_1 = top_border[x];
                const top_2 = top_border[x + 1];
                const bottom_1 = bottom_border[x];
                const bottom_2 = bottom_border[x + 1];
                const left_1 = left_border[y];
                const left_2 = left_border[y + 1];
                const right_1 = right_border[y];
                const right_2 = right_border[y + 1];

                let a = { x: 0, y: 0 };
                let b = { x: 0, y: 0 };
                let c = { x: 0, y: 0 };
                let d = { x: 0, y: 0 };

                const width1 = right_1.x - left_1.x;
                const width2 = right_2.x - left_2.x;
                const height1 = bottom_1.y - top_1.y;
                const height2 = bottom_2.y - top_2.y;

                a.x = interpolation_number(x / (x_n - 1), left_1.x, right_1.x);
                a.y = interpolation_number(y / (y_n - 1), top_1.y, bottom_1.y);

                b.x = interpolation_number((x + 1) / (x_n - 1), left_1.x, right_1.x);
                b.y = interpolation_number(y / (y_n - 1), top_2.y, bottom_2.y);

                c.x = interpolation_number((x + 1) / (x_n - 1), left_2.x, right_2.x);
                c.y = interpolation_number((y + 1) / (y_n - 1), top_2.y, bottom_2.y);

                d.x = interpolation_number(x / (x_n - 1), left_2.x, right_2.x);
                d.y = interpolation_number((y + 1) / (y_n - 1), top_1.y, bottom_1.y);

                if (y === 0) {
                    console.log(222);
                    a.y = top_1.y;
                    b.y = top_2.y;
                }
                if (y + 1 == y_n - 1) {
                    d.y = bottom_1.y;
                    c.y = bottom_2.y;
                }
                if (x === 0) {
                    a.x = left_1.x;
                    d.x = left_2.x;
                }
                if (x + 1 === x_n - 1) {
                    b.x = right_1.x;
                    c.x = right_2.x;
                }
                a.x = Math.round(a.x);
                a.y = Math.round(a.y);

                b.x = Math.round(b.x);
                b.y = Math.round(b.y);

                c.x = Math.round(c.x);
                c.y = Math.round(c.y);

                d.x = Math.round(d.x);
                d.y = Math.round(d.y);

                const uv_step_x = uv_width / x_n;
                const uv_step_y = uv_height / y_n;
                const uv_a = { x: Math.round(x * uv_step_x), y: Math.round(y * uv_step_y) };
                const uv_b = { x: Math.round((x + 1) * uv_step_x), y: Math.round(y * uv_step_y) };
                const uv_c = { x: Math.round((x + 1) * uv_step_x), y: Math.round((y + 1) * uv_step_y) };
                const uv_d = { x: Math.round(x * uv_step_x), y: Math.round((y + 1) * uv_step_y) };
                const uv_grid = new UVGrid(uv_a, uv_b, uv_c, uv_d);

                const grid = new VertexGrid(a, b, c, d, uv_grid);
                grids.push(grid);
            }
        }
        this.grids = grids;
    }
    render(cb: (point: Point, uv_point: Point) => void) {
        for (let item of this.grids) {
            item.render(this.ctx, cb);
        }
    }
}

class Grid<T> {
    a: T;
    b: T;
    c: T;
    d: T;
    constructor(a: T, b: T, c: T, d: T) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}

class VertexGrid extends Grid<Point> {
    /*四个点 顺时针方向*/
    uv_grid: UVGrid;
    constructor(a: Point, b: Point, c: Point, d: Point, uv_grid: UVGrid) {
        super(a, b, c, d);
        this.uv_grid = uv_grid;
    }
    render(ctx: CanvasRenderingContext2D, cb: (point: Point, uv_point: Point) => void) {
        const triangleA = new VectexTriangle(
            this.c,
            this.a,
            this.b,
            new UVTriangle(this.uv_grid.c, this.uv_grid.a, this.uv_grid.b),
            triangle_render
        );
        const triangleB = new VectexTriangle(
            this.d,
            this.a,
            this.c,
            new UVTriangle(this.uv_grid.a, this.uv_grid.a, this.uv_grid.c),
            triangle_render
        );
        triangleA.render(ctx, cb);
        triangleB.render(ctx, cb);
    }
}

class UVGrid extends Grid<Point> {
    constructor(a: Point, b: Point, c: Point, d: Point) {
        super(a, b, c, d);
    }
}

abstract class Triangle<T> {
    a: T;
    b: T;
    c: T;
    constructor(a: T, b: T, c: T) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

class UVTriangle extends Triangle<Point> {
    constructor(a: Point, b: Point, c: Point) {
        super(a, b, c);
    }
}

class VectexTriangle extends Triangle<Point> {
    uv: UVTriangle;
    render_fn: (
        ctx: CanvasRenderingContext2D,
        a: Point,
        b: Point,
        c: Point,
        uv: UVTriangle,
        cb: (point: Point, uv_point: Point) => void
    ) => void;
    constructor(
        a: Point,
        b: Point,
        c: Point,
        uv: UVTriangle,
        render_fn: (
            ctx: CanvasRenderingContext2D,
            a: Point,
            b: Point,
            c: Point,
            uv: UVTriangle,
            cb: (point: Point, uv_point: Point) => void
        ) => void
    ) {
        super(a, b, c);
        this.uv = uv;
        this.render_fn = render_fn;
    }

    render(ctx: CanvasRenderingContext2D, cb: (point: Point, uv_point: Point) => void) {
        this.render_fn(ctx, this.a, this.b, this.c, this.uv, cb);
    }
}

function triangle_render(
    ctx: CanvasRenderingContext2D,
    a: Point,
    b: Point,
    c: Point,
    uv: UVTriangle,
    cb: (point: Point, uv_point: Point) => void
) {
    // ctx.strokeStyle = "black";
    // ctx.beginPath();
    // ctx.moveTo(a.x, a.y);
    // ctx.lineTo(b.x, b.y);
    // ctx.lineTo(c.x, c.y);
    // ctx.closePath();
    // ctx.stroke();
    // return;
    let min_x = Math.min(a.x, b.x, c.x);
    let max_x = Math.max(a.x, b.x, c.x);
    let min_y = Math.min(a.y, b.y, c.y);
    let max_y = Math.max(a.y, b.y, c.y);
    for (let y = min_y; y <= max_y; ++y) {
        for (let x = min_x; x < max_x; ++x) {
            const alpha =
                ((a.y - b.y) * x + (b.x - a.x) * y + a.x * b.y - b.x * a.y) /
                ((a.y - b.y) * c.x + (b.x - a.x) * c.y + a.x * b.y - b.x * a.y);
            const bate =
                ((a.y - c.y) * x + (c.x - a.x) * y + a.x * c.y - c.x * a.y) /
                ((a.y - c.y) * b.x + (c.x - a.x) * b.y + a.x * c.y - c.x * a.y);
            const gamma = 1 - alpha - bate;
            if (alpha >= 0 && bate >= 0 && gamma >= 0 && alpha + bate + gamma === 1) {
                const _x = alpha * uv.c.x + bate * uv.b.x + gamma * uv.a.x;
                const _y = alpha * uv.c.y + bate * uv.b.y + gamma * uv.a.y;
                const point = { x, y };
                const uv_point = { x: Math.round(_x), y: Math.round(_y) };
                cb(point, uv_point);
            }
        }
    }
}

console.time("1");
const width = 1048;
const height = 1200;
const img_url = "/7.jpg";

const bezier_points = [
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

const b1 = [
    { x: 269.0, y: -1.3 },
    { x: 206.7, y: 1.3 },
    { x: 141.8, y: 14.3 },
    { x: 90.8, y: 45.3 },
    { x: 107.0, y: 318.0 },
    { x: 115.0, y: 584.9 },
    { x: -6.5, y: 893.5 },
    { x: 21.8, y: 930.5 },
    { x: 74.2, y: 949.0 },
    { x: 122.5, y: 955.5 },
    { x: 347.0, y: 647.9 },
    { x: 289.5, y: 304.5 },
];

const b2 = [
    { x: 0.5, y: -0.5 },
    { x: 146.4, y: 69.1 },
    { x: 131.8, y: 283.5 },
    { x: 143.8, y: 464.0 },
    { x: 138.6, y: 472.5 },
    { x: 133.1, y: 481.4 },
    { x: 125.9, y: 493.8 },
    { x: 108.8, y: 296.5 },
    { x: 120.7, y: 116.0 },
    { x: 6.6, y: 36.3 },
    { x: 5.3, y: 23.6 },
    { x: 3.2, y: 11.8 },
];

async function fn(image: string, width: number, height: number, bezier_points: Array<Point>): Promise<string> {
    const img = await LoadImageBySize(image, width, height);
    const img_el = await loadImage(img);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // document.body.append(canvas);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img_el, 0, 0, width, height);
    const origin_imgdata = ctx.getImageData(0, 0, width, height);
    const target_imagedata = ctx.createImageData(width, height);
    const channels = origin_imgdata.data.length / (origin_imgdata.width * origin_imgdata.height);
    function cb(point: Point, uv_point: Point) {
        // console.log(point, uv_point);
        for (let i = 0; i < channels; ++i) {
            px[i] = origin_imgdata.data[uv_point.y * width * channels + uv_point.x * channels + i];
        }
        for (let i = 0; i < channels; ++i) {
            target_imagedata.data[point.y * width * channels + point.x * channels + i] = px[i];
        }
    }
    const [top_bezier, right_bezier, bottom_bezier, left_bezier] = createBezier(bezier_points);
    const n = Math.round(Math.max(width, height) / 80);
    const top_points = getLUTByLen(top_bezier, n);
    const right_points = getLUTByLen(right_bezier, n);
    const bottom_points = getLUTByLen(bottom_bezier, n);
    const left_points = getLUTByLen(left_bezier, n);
    const mesh = new Mesh(ctx, [top_points, right_points, bottom_points, left_points], n, width, height);

    const px = new Uint8Array([0, 0, 0, 255]);

    mesh.render(cb);
    // ctx.clearRect(0, 0, width, height);
    ctx.putImageData(target_imagedata, 0, 0);

    const points = pointHandler(bezier_points, false);

    const url_canvas = document.createElement("canvas");
    url_canvas.width = width;
    url_canvas.height = height;
    const url_ctx = url_canvas.getContext("2d")!;
    url_ctx.beginPath();
    points.forEach((item) => {
        url_ctx.moveTo(item[0].x, item[0].y);
        url_ctx.bezierCurveTo(item[1].x, item[1].y, item[2].x, item[2].y, item[3].x, item[3].y);
    });
    url_ctx.closePath();
    url_ctx.stroke();
    url_ctx.drawImage(canvas, 0, 0);
    return url_canvas.toDataURL();
}

const url = await fn(img_url, 1048, 1200, bezier_points);
const img = new Image();
img.src = url;
document.body.append(img);

export { Mesh, fn };
