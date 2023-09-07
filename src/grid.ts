if (typeof (window as any).global === "undefined") {
    (window as any).global = window;
}
import { matrix, det, row } from "mathjs";
import Delaunator from "delaunator";
import p2t from "poly2tri";

import { Bezier, type Point } from "bezier-js";
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
    is_out_range,
    double_itnerpllation_point,
    radialBasisFunctionInterpolation,
    length_points,
    inverseDistanceWeighting,
} from "./utils";

class Mesh {
    ctx: CanvasRenderingContext2D;
    borders: Array<Border> = [];
    grids: Array<VertexGrid> = [];
    triangles: Array<VectexTriangle> = [];
    constructor(
        ctx: CanvasRenderingContext2D,
        borders: Array<Border>,
        n: number,
        uv_width: number,
        uv_height: number,
        factor: number
    ) {
        this.ctx = ctx;
        this.borders = borders;
        this.cteate_grid(this.borders, uv_width, uv_height);
        // this.crate_triangle(this.borders, uv_width, uv_height, factor);
    }

    cteate_grid(borders: Array<Border>, uv_width: number, uv_height: number) {
        const grids: Array<VertexGrid> = [];
        const top_border = borders[0];
        const right_border = borders[1];
        const bottom_border = borders[2];
        const left_border = borders[3];

        const x_n = top_border.point.length;
        const y_n = right_border.point.length;

        let max_border1 = top_border;
        let max_border2 = bottom_border;
        let min_border1 = left_border;
        let min_border2 = right_border;

        if (y_n > x_n) {
            [max_border1, min_border1] = [min_border1, max_border1];
            [max_border2, min_border2] = [min_border2, max_border2];
        }

        console.log(x_n, y_n);
        const grid_points = new Array(y_n);
        for (let i = 0; i < y_n; ++i) {
            const rows = new Array(x_n);
            for (let j = 0; j < x_n; ++j) {
                rows[j] = { x: 0, y: 0 };
            }
            grid_points[i] = rows;
        }
        for (let i = 0; i < x_n; ++i) {
            grid_points[0][i] = top_border.point[i];
        }
        for (let i = 0; i < y_n; ++i) {
            grid_points[i][x_n - 1] = right_border.point[i];
        }
        for (let i = 0; i < x_n; ++i) {
            grid_points[y_n - 1][i] = bottom_border.point[i];
        }
        for (let i = 0; i < y_n; ++i) {
            grid_points[i][0] = left_border.point[i];
        }
        console.log(x_n, y_n);
        console.log(top_border.point);
        for (let y = 1; y < y_n - 1; ++y) {
            for (let x = 1; x < x_n - 1; ++x) {
                // grid_points[y][x].x = interpolation_number(x/(x_n-1),top_border.point[y].x,bottom_border.point[y].x)
                // grid_points[y][x].y = interpolation_number(y/(y_n-1),left_border.point[x].y,right_border.point[x].y)

                const x_length = length_points(left_border.point[y], right_border.point[y]);
                const y_length = length_points(top_border.point[x], bottom_border.point[x]);
                let p;
                if (x_length > y_length) {
                    p = interpolation(y / (y_n - 1), top_border.point[x], bottom_border.point[x]);
                } else {
                    p = interpolation(x / (x_n - 1), left_border.point[y], right_border.point[y]);
                }
                grid_points[y][x] = p;

                // const rx = x / (x_n - 1)
                // const ry = y / (y_n - 1)
                // const p = double_itnerpllation_point(rx,ry,top_border.point[x],right_border.point[y],bottom_border.point[x],left_border.point[y])
                const point = inverseDistanceWeighting(
                    [
                        { x: x, y: 0 },
                        { x: x_n - 1, y: y },
                        { x: x, y: y_n - 1 },
                        { x: 0, y: y },
                    ],
                    [top_border.point[x], right_border.point[y], bottom_border.point[x], left_border.point[y]],
                    { x: x, y: y },
                    1
                );
                grid_points[y][x] = point;
            }
        }

        for (let y = 0; y < y_n - 1; ++y) {
            for (let x = 0; x < x_n - 1; ++x) {
                let a = grid_points[y][x];
                let b = grid_points[y][x + 1];
                let c = grid_points[y + 1][x + 1];
                let d = grid_points[y + 1][x];

                a.x = Math.round(a.x);
                a.y = Math.round(a.y);

                b.x = Math.round(b.x);
                b.y = Math.round(b.y);

                c.x = Math.round(c.x);
                c.y = Math.round(c.y);

                d.x = Math.round(d.x);
                d.y = Math.round(d.y);

                const uv_step_x = uv_width / (x_n - 1);
                const uv_step_y = uv_height / (y_n - 1);
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
    crate_triangle(borders: Array<Border>, width: number, height: number, factor: number) {
        const x_n = Math.max(5, Math.round(width / factor));
        const y_n = Math.max(5, Math.round(height / factor));

        const [top_border, right_border, bottom_border, left_border] = borders;
        const a = top_border.point.flatMap((item) => new p2t.Point(item.x, item.y));
        const b = right_border.point.flatMap((item) => new p2t.Point(item.x, item.y));
        const c = bottom_border.point.flatMap((item) => new p2t.Point(item.x, item.y));
        const d = left_border.point.flatMap((item) => new p2t.Point(item.x, item.y));
        a.pop();
        b.pop();
        c.pop();
        d.pop();

        const tt = [];
        const bb = [];
        const ll = [];
        const rr = [];
        const x_step = width / x_n;
        const y_step = height / y_n;

        for (let i = 0; i <= y_n; ++i) {
            rr[i] = new p2t.Point(width, y_step * i);
            ll[i] = new p2t.Point(0, y_step * i);
        }
        for (let i = 0; i <= x_n; ++i) {
            tt[i] = new p2t.Point(x_step * i, 0);
            bb[i] = new p2t.Point(x_step * i, height);
        }
        bb.reverse();
        ll.reverse();
        tt.pop();
        rr.pop();
        bb.pop();
        ll.pop();

        const _coords = ([] as poly2tri.Point[]).concat(tt).concat(rr).concat(bb).concat(ll);
        const _swctx = new p2t.SweepContext(_coords);
        _swctx.triangulate();
        const _triangles = _swctx.getTriangles();

        const coords = ([] as poly2tri.Point[]).concat(a).concat(b).concat(c).concat(d);
        const swctx = new p2t.SweepContext(coords);
        swctx.triangulate();
        const triangles = swctx.getTriangles();
        console.log(_triangles, triangles);

        for (let i = 0; i < triangles.length; ++i) {
            const triangle = triangles[i];
            const _triangle = _triangles[i];
            const points = triangle.getPoints().map((item) => {
                item.x = Math.round(item.x);
                item.y = Math.round(item.y);
                return item;
            });
            const _pointes = _triangle.getPoints().map((item) => {
                item.x = Math.round(item.x);
                item.y = Math.round(item.y);
                return item;
            });
            this.triangles.push(
                new VectexTriangle(
                    points[0],
                    points[1],
                    points[2],
                    new UVTriangle(_pointes[0], _pointes[1], _pointes[2]),
                    triangle_render
                )
            );
        }
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
            if (alpha >= 0 && bate >= 0 && gamma >= 0) {
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

class Border {
    bezier: Bezier;
    origin_point: Array<Point>;
    point: Array<Point>;
    constructor(points: Array<Point>, n: number) {
        this.origin_point = points;
        const bezier = new Bezier(points);
        this.bezier = bezier;
        this.point = getLUTByLen(bezier, n);
    }
}
async function fn(
    image: string,
    width: number,
    height: number,
    bezier_points: Array<Point>,
    factor = 2
): Promise<string> {
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

    const n = Math.round(Math.max(width, height) / 2);
    const x_n = Math.max(5, Math.round(width / factor));
    const y_n = Math.max(5, Math.round(height / factor));
    const [top, right, bottom, left] = pointHandler(bezier_points, true);

    const top_border = new Border(top, x_n);
    const right_border = new Border(right, y_n);
    const bottom_border = new Border(bottom, x_n);
    const left_border = new Border(left, y_n);

    const mesh = new Mesh(ctx, [top_border, right_border, bottom_border, left_border], n, width, height, factor);
    console.log(mesh);
    const px = new Uint8Array([0, 0, 0, 0]);

    function cb(point: Point, uv_point: Point) {
        for (let i = 0; i < channels; ++i) {
            px[i] = origin_imgdata.data[uv_point.y * width * channels + uv_point.x * channels + i];
        }
        if (is_out_range(point.x, point.y, 0, width, 0, height)) {
            px[0] = 0;
            px[1] = 0;
            px[2] = 0;
            px[3] = 0;
        }
        for (let i = 0; i < channels; ++i) {
            target_imagedata.data[point.y * width * channels + point.x * channels + i] = px[i];
        }
    }
    mesh.render(cb);
    ctx.clearRect(0, 0, width, height);
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
    // url_ctx.strokeStyle = "red";
    // url_ctx.closePath();
    // url_ctx.clip();
    // url_ctx.stroke();
    url_ctx.drawImage(canvas, 0, 0);
    return url_canvas.toDataURL();
}

console.time("1");
const url = await fn(img_url, 1048, 1200, bezier_points, 5);
console.timeEnd("1");
const img = new Image();
img.src = url;
document.body.append(img);

export { Mesh, fn };
