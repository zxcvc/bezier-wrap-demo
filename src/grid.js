import { Bezier } from "bezier-js";
import { pointHandler, getLUTByLen, interpolation, LoadImageBySize, loadImage, is_out_range, length_points, inverseDistanceWeighting, } from "./utils";
class Mesh {
    constructor(ctx, borders, n, uv_width, uv_height) {
        Object.defineProperty(this, "ctx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "borders", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "grids", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.ctx = ctx;
        this.borders = borders;
        this.cteate_grid(this.borders, uv_width, uv_height);
    }
    cteate_grid(borders, uv_width, uv_height) {
        const grids = [];
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
                }
                else {
                    p = interpolation(x / (x_n - 1), left_border.point[y], right_border.point[y]);
                }
                // const rx = x / (x_n - 1)
                // const ry = y / (y_n - 1)
                // const p = double_itnerpllation_point(rx,ry,top_border.point[x],right_border.point[y],bottom_border.point[x],left_border.point[y])
                const point = inverseDistanceWeighting([{ x: x, y: 0 }, { x: x_n - 1, y: y }, { x: x, y: y_n - 1 }, { x: 0, y: y }], [top_border.point[x], right_border.point[y], bottom_border.point[x], left_border.point[y]], { x, y }, 1);
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
    render(cb) {
        for (let item of this.grids) {
            item.render(this.ctx, cb);
        }
    }
}
class Grid {
    constructor(a, b, c, d) {
        Object.defineProperty(this, "a", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "b", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "c", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "d", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}
class VertexGrid extends Grid {
    constructor(a, b, c, d, uv_grid) {
        super(a, b, c, d);
        /*四个点 顺时针方向*/
        Object.defineProperty(this, "uv_grid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.uv_grid = uv_grid;
    }
    render(ctx, cb) {
        const triangleA = new VectexTriangle(this.c, this.a, this.b, new UVTriangle(this.uv_grid.c, this.uv_grid.a, this.uv_grid.b), triangle_render);
        const triangleB = new VectexTriangle(this.d, this.a, this.c, new UVTriangle(this.uv_grid.a, this.uv_grid.a, this.uv_grid.c), triangle_render);
        triangleA.render(ctx, cb);
        triangleB.render(ctx, cb);
    }
}
class UVGrid extends Grid {
    constructor(a, b, c, d) {
        super(a, b, c, d);
    }
}
class Triangle {
    constructor(a, b, c) {
        Object.defineProperty(this, "a", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "b", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "c", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.a = a;
        this.b = b;
        this.c = c;
    }
}
class UVTriangle extends Triangle {
    constructor(a, b, c) {
        super(a, b, c);
    }
}
class VectexTriangle extends Triangle {
    constructor(a, b, c, uv, render_fn) {
        super(a, b, c);
        Object.defineProperty(this, "uv", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "render_fn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.uv = uv;
        this.render_fn = render_fn;
    }
    render(ctx, cb) {
        this.render_fn(ctx, this.a, this.b, this.c, this.uv, cb);
    }
}
function triangle_render(ctx, a, b, c, uv, cb) {
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
            const alpha = ((a.y - b.y) * x + (b.x - a.x) * y + a.x * b.y - b.x * a.y) /
                ((a.y - b.y) * c.x + (b.x - a.x) * c.y + a.x * b.y - b.x * a.y);
            const bate = ((a.y - c.y) * x + (c.x - a.x) * y + a.x * c.y - c.x * a.y) /
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
    constructor(points, n) {
        Object.defineProperty(this, "bezier", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "origin_point", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "point", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.origin_point = points;
        const bezier = new Bezier(points);
        this.bezier = bezier;
        this.point = getLUTByLen(bezier, n);
    }
}
async function fn(image, width, height, bezier_points, factor = 2) {
    const img = await LoadImageBySize(image, width, height);
    const img_el = await loadImage(img);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // document.body.append(canvas);
    const ctx = canvas.getContext("2d");
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
    // const top_points = getLUTByLen(top_bezier, x_n);
    // const right_points = getLUTByLen(right_bezier, y_n);
    // const bottom_points = getLUTByLen(bottom_bezier, x_n);
    // const left_points = getLUTByLen(left_bezier, y_n);
    const mesh = new Mesh(ctx, [top_border, right_border, bottom_border, left_border], n, width, height);
    const px = new Uint8Array([0, 0, 0, 0]);
    function cb(point, uv_point) {
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
    const url_ctx = url_canvas.getContext("2d");
    url_ctx.beginPath();
    points.forEach((item) => {
        url_ctx.moveTo(item[0].x, item[0].y);
        url_ctx.bezierCurveTo(item[1].x, item[1].y, item[2].x, item[2].y, item[3].x, item[3].y);
    });
    // url_ctx.strokeStyle = 'red'
    // url_ctx.closePath();
    // url_ctx.clip()
    // url_ctx.stroke();
    url_ctx.drawImage(canvas, 0, 0);
    return url_canvas.toDataURL();
}
// console.time('1')
// const url = await fn(img_url, 1048, 1200, bezier_points,3);
// console.timeEnd('1')
// const img = new Image();
// img.src = url;
// document.body.append(img);
export { Mesh, fn };