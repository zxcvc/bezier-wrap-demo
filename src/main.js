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
/* eslint-disable */
var bezier_js_1 = require("bezier-js");
var utils_1 = require("./utils");
function fn(img_url, width, height, bezier_point) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, top_bezier, right_bezier, bottom_bezier, left_bezier, i, img, canvas, ctx, origin_imgdata, channels, target_imagedata, top_arr, bottom_arr, left_arr, right_arr, i, top_pro, bottom_pro, i, left_pro, right_pro, bezier_utils, box, y, x, top_pro, bottom_pro, left_pro, right_pro, px, x_rate, y_rate, origin_x, origin_y, i, i;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, utils_1.createBezier)(bezier_point), top_bezier = _a[0], right_bezier = _a[1], bottom_bezier = _a[2], left_bezier = _a[3];
                    for (i = 0; i < 1; i += 0.01) {
                        // console.log(top_bezier.compute(i));
                    }
                    return [4 /*yield*/, (0, utils_1.loadImage)(img_url)];
                case 1:
                    img = _b.sent();
                    canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    ctx = canvas === null || canvas === void 0 ? void 0 : canvas.getContext("2d");
                    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, width, height);
                    origin_imgdata = ctx === null || ctx === void 0 ? void 0 : ctx.getImageData(0, 0, width, height);
                    channels = origin_imgdata.data.length / (width * height);
                    target_imagedata = new ImageData(width, height);
                    console.log(target_imagedata);
                    top_arr = new Array(height);
                    bottom_arr = new Array(height);
                    left_arr = new Array(width);
                    right_arr = new Array(width);
                    for (i = 0; i < width; ++i) {
                        top_pro = top_bezier.project({ x: i, y: 0 });
                        bottom_pro = top_bezier.project({ x: i, y: height });
                        top_arr[i] = top_pro;
                        bottom_arr[i] = bottom_pro;
                    }
                    for (i = 0; i < height; ++i) {
                        left_pro = top_bezier.project({ x: 0, y: i });
                        right_pro = top_bezier.project({ x: width, y: i });
                        left_arr[i] = left_pro;
                        right_arr[i] = right_pro;
                    }
                    bezier_utils = bezier_js_1.Bezier.getUtils();
                    box = bezier_utils.findbbox([top_bezier, right_bezier, bottom_bezier, left_bezier]);
                    for (y = 0; y < height; ++y) {
                        for (x = 0; x < width; ++x) {
                            top_pro = top_bezier.project({ x: x, y: y });
                            bottom_pro = bottom_bezier.project({ x: x, y: y });
                            left_pro = left_bezier.project({ x: x, y: y });
                            right_pro = right_bezier.project({ x: x, y: y });
                            px = new Uint8Array([0, 0, 0, 255]);
                            x_rate = (x - left_pro.x) / (right_pro.x - left_pro.x);
                            y_rate = (y - top_pro.y) / (bottom_pro.y - top_pro.y);
                            if (!(0, utils_1.is_out_range)(x, y, {
                                x: { min: left_pro.x, max: right_pro.x },
                                y: { min: top_pro.y, max: bottom_pro.y },
                            })) {
                                origin_x = (0, utils_1.interpolation)(x_rate, 0, width);
                                origin_y = (0, utils_1.interpolation)(y_rate, 0, height);
                                for (i = 0; i < channels; ++i) {
                                    px[i] = origin_imgdata.data[origin_y * width * channels + origin_x * channels + i];
                                }
                            }
                            for (i = 0; i < channels; ++i) {
                                target_imagedata.data[y * width * channels + x * channels + i] = px[i];
                            }
                        }
                    }
                    origin_imgdata = target_imagedata;
                    // for (let y = 0; y < height; ++y) {
                    //     for (let x = 0; x < width; ++x) {
                    //         const top = 0;
                    //         const bottom = bottom_arr[x].y;
                    //         const left = 0;
                    //         const right = width;
                    //         const px = new Uint8Array([0, 0, 0, 255]);
                    //         let x_rate = (x - left) / (right - left);
                    //         let y_rate = (y - top) / (bottom - top);
                    //         if (
                    //             !is_out_range(x, y, {
                    //                 x: { min: left, max: right },
                    //                 y: { min: top, max: bottom },
                    //             })
                    //         ) {
                    //             let origin_x = interpolation(x_rate, 0, width);
                    //             let origin_y = interpolation(y_rate, 0, height);
                    //             for (let i = 0; i < channels; ++i) {
                    //                 px[i] = origin_imgdata.data[origin_y * width * channels + origin_x * channels + i];
                    //             }
                    //         }
                    //         for (let i = 0; i < channels; ++i) {
                    //             target_imagedata.data[y * width * channels + x * channels + i] = px[i];
                    //         }
                    //     }
                    // }
                    ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, width, height);
                    ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(target_imagedata, 0, 0);
                    return [2 /*return*/, canvas.toDataURL()];
            }
        });
    });
}
exports.default = fn;
var pint = [
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
// const url = await fn("/6.webp", 1048, 1200, pint);
// const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
// const ctx = canvas.getContext("2d");
// const img = await loadImage(url);
// canvas.width = img.width;
// canvas.height = img.height;
// ctx?.drawImage(img, 0, 0);
