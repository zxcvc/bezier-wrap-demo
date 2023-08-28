"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.length_points = exports.interpolation_number = exports.is_out_by_points = exports.getLUTByLen = exports.gs_length = exports.binary_search = exports.LoadImageBySize = exports.pointHandler = exports.createBezier = exports.interpolation = exports.is_out_range_by_box = exports.is_out_range = exports.loadImage = void 0;
var bezier_js_1 = require("bezier-js");
var ERROR_MARGIN = 0.001;
function loadImage(url) {
    var img = new Image();
    return new Promise(function (res) {
        img.addEventListener("load", res.bind(null, img));
        img.src = url;
    });
}
exports.loadImage = loadImage;
function is_out_range(x, y, start_x, end_x, start_y, end_y) {
    return x < start_x || x > end_x || y < start_y || y > end_y;
}
exports.is_out_range = is_out_range;
function is_out_by_points(x, y, width, height, points) {
    var left = Number.MAX_SAFE_INTEGER;
    var right = Number.MIN_SAFE_INTEGER;
    var top = Number.MAX_SAFE_INTEGER;
    var bottom = Number.MIN_SAFE_INTEGER;
    points.forEach(function (point) {
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
exports.is_out_by_points = is_out_by_points;
function is_out_range_by_box(x, y, box) {
    var rang_x = box.x;
    var rang_y = box.y;
    return x < rang_x.min || x > rang_x.max || y < rang_y.min || y > rang_y.max;
}
exports.is_out_range_by_box = is_out_range_by_box;
function interpolation(rate, start, end) {
    var x = Math.round((1 - rate) * start.x + rate * end.x);
    var y = Math.round((1 - rate) * start.y + rate * end.y);
    return { x: x, y: y };
}
exports.interpolation = interpolation;
function interpolation_number(rate, start, end) {
    return (1 - rate) * start + rate * end;
}
exports.interpolation_number = interpolation_number;
function pointHandler(points) {
    var res = [];
    var length = points.length;
    var i = 0;
    while (i < 4) {
        var k = i * 3;
        var j = 0;
        var arr = [];
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
exports.pointHandler = pointHandler;
function createBezier(points) {
    var p = pointHandler(points);
    return p.map(function (item) { return new bezier_js_1.Bezier(item); });
}
exports.createBezier = createBezier;
function LoadImageBySize(url, width, height) {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, ctx, img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    ctx = canvas.getContext("2d");
                    return [4 /*yield*/, loadImage(url)];
                case 1:
                    img = _a.sent();
                    console.log(url);
                    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, width, height);
                    return [2 /*return*/, canvas.toDataURL()];
            }
        });
    });
}
exports.LoadImageBySize = LoadImageBySize;
function binary_search(generator, target, left, right, margin_error) {
    while (left <= right) {
        var mid = (left + right) / 2;
        var ans = generator(mid);
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
exports.binary_search = binary_search;
function length(bezier, t) {
    var d = bezier.derivative(t);
    return Math.sqrt(Math.pow(d.x, 2) + Math.pow(d.y, 2));
}
function length_points(p1, p2) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
}
exports.length_points = length_points;
function gs_length(bezier, t) {
    return ((t / 2) *
        (length(bezier, ((t / 2) * -1) / Math.sqrt(3) + t / 2) + length(bezier, ((t / 2) * 1) / Math.sqrt(3) + t / 2)));
}
exports.gs_length = gs_length;
function getLUTByLen(bezier, n) {
    var ans = new Array(n);
    var length = gs_length(bezier, 1);
    var setp_length = length / n;
    var generator = gs_length.bind(null, bezier);
    for (var i = 0; i < n; ++i) {
        var len = i * setp_length;
        var t = binary_search(generator, len, 0, 1, ERROR_MARGIN);
        ans[i] = bezier.compute(t);
    }
    return ans;
}
exports.getLUTByLen = getLUTByLen;
