import { Bezier } from "bezier-js";
const ERROR_MARGIN = 0.001;
function loadImage(url) {
    const img = new Image();
    return new Promise((res) => {
        img.addEventListener("load", res.bind(null, img));
        img.src = url;
    });
}
function is_out_range(x, y, start_x, end_x, start_y, end_y) {
    return x < start_x || x > end_x || y < start_y || y > end_y;
}
function is_out_by_points(x, y, width, height, points) {
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
function is_out_range_by_box(x, y, box) {
    const rang_x = box.x;
    const rang_y = box.y;
    return x < rang_x.min || x > rang_x.max || y < rang_y.min || y > rang_y.max;
}
function interpolation(rate, start, end) {
    const x = Math.round((1 - rate) * start.x + rate * end.x);
    const y = Math.round((1 - rate) * start.y + rate * end.y);
    return { x, y };
}
function interpolation_number(rate, start, end) {
    return (1 - rate) * start + rate * end;
}
function pointHandler(points, reverse = true) {
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
function createBezier(points) {
    const p = pointHandler(points);
    return p.map((item) => new Bezier(item));
}
async function LoadImageBySize(url, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const img = await loadImage(url);
    console.log(url);
    ctx?.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL();
}
function binary_search(generator, target, left, right, margin_error) {
    while (left <= right) {
        let mid = (left + right) / 2;
        const ans = generator(mid);
        if (Math.abs(ans - target) <= margin_error) {
            return mid;
        }
        else if (ans < target) {
            left = mid;
        }
        else {
            right = mid;
        }
    }
    return left;
}
function length(bezier, t) {
    const d = bezier.derivative(t);
    return Math.sqrt(d.x ** 2 + d.y ** 2);
}
function length_points(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
function gs_length(bezier, t) {
    return ((t / 2) *
        (length(bezier, ((t / 2) * -1) / Math.sqrt(3) + t / 2) + length(bezier, ((t / 2) * 1) / Math.sqrt(3) + t / 2)));
}
function getLUTByLen(bezier, n) {
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
export { loadImage, is_out_range, is_out_range_by_box, interpolation, createBezier, pointHandler, LoadImageBySize, binary_search, gs_length, getLUTByLen, is_out_by_points, interpolation_number, length_points, };
