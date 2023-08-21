"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBezier = exports.interpolation = exports.is_out_range = exports.loadImage = void 0;
var bezier_js_1 = require("bezier-js");
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
function is_out_range_by_box(x, y, box) {
    var rang_x = box.x;
    var rang_y = box.y;
    return x < rang_x.min || x > rang_x.max || y < rang_y.min || y > rang_y.max;
}
function interpolation(rate, start, end) {
    var x = Math.round((1 - rate) * start.x + rate * end.x);
    var y = Math.round((1 - rate) * start.y + rate * end.y);
    return { x: x, y: y };
}
exports.interpolation = interpolation;
function createBezier(points) {
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
            arr.reverse();
        }
        res.push(new bezier_js_1.Bezier(arr));
        ++i;
    }
    return res;
}
exports.createBezier = createBezier;
