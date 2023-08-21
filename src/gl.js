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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var width = 1048;
var height = 1200;
var bezier_points = [
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
var utils_1 = require("./utils");
var img_url = "/6.webp";
function fn(width, height, imgurl, bezier_points) {
    return __awaiter(this, void 0, void 0, function () {
        var v_shader_string, f_shader_string, img_el, _a, top_bezier, right_bezier, bottom_bezier, left_bezier, _top_points, _right_points, _bottom_points, _left_points, top_points, right_points, bottom_points, left_points, width_arr, height_arr, _top_img_points, _right_img_points, _bottom_img_points, _left_img_points, top_img_points, right_img_points, bottom_img_points, left_img_points, v_points, f_points, canvas2d_el, ctx, canvas, gl, v_shader, f_shader, program, texture, u_sampler, vertex_buffer, frag_buffer, a_vertex_coords, a_texture_coords;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    v_shader_string = "\n    attribute vec2 a_texture_coords;\n    attribute vec2 a_vertex_coords;\n    varying vec2 v_texture_coords;\n    \n    void main(){\n        v_texture_coords = a_texture_coords;\n        gl_PointSize = 1.0;\n        gl_Position = vec4(a_vertex_coords,0,1);\n    }\n    ";
                    f_shader_string = "precision mediump float;\n    varying vec2 v_texture_coords;\n    uniform sampler2D u_sampler;\n    \n    void main(){\n        gl_FragColor = texture2D(u_sampler,v_texture_coords);\n    }";
                    return [4 /*yield*/, (0, utils_1.loadImage)(imgurl)];
                case 1:
                    img_el = _b.sent();
                    _a = (0, utils_1.createBezier)(bezier_points), top_bezier = _a[0], right_bezier = _a[1], bottom_bezier = _a[2], left_bezier = _a[3];
                    _top_points = top_bezier.getLUT(width).map(function (item, index) {
                        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
                    });
                    _right_points = right_bezier.getLUT(height).map(function (item, index) {
                        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
                    });
                    _bottom_points = bottom_bezier.getLUT(width).map(function (item, index) {
                        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
                    });
                    _left_points = left_bezier.getLUT(height).map(function (item, index) {
                        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
                    });
                    top_points = _top_points.flat(1);
                    right_points = _right_points.flat(1);
                    right_points.shift();
                    right_points.shift();
                    _bottom_points.reverse();
                    bottom_points = _bottom_points.flat(1);
                    bottom_points.shift();
                    bottom_points.shift();
                    _left_points.reverse();
                    left_points = _left_points.flat(1);
                    left_points.pop();
                    left_points.pop();
                    left_points.shift();
                    left_points.shift();
                    width_arr = new Array(width + 1).fill(0);
                    height_arr = new Array(height + 1).fill(0);
                    _top_img_points = width_arr.map(function (item, index) { return [(index - 0) / width, 1]; });
                    _right_img_points = height_arr.map(function (item, index) { return [1, (height - index) / height]; });
                    _bottom_img_points = width_arr.map(function (item, index) { return [(index - 0) / width, 0]; });
                    _left_img_points = height_arr.map(function (item, index) { return [0, (height - index) / height]; });
                    top_img_points = _top_img_points.flat(1);
                    right_img_points = _right_img_points.flat(1);
                    right_img_points.shift();
                    right_img_points.shift();
                    _bottom_img_points.reverse();
                    bottom_img_points = _bottom_img_points.flat(1);
                    bottom_img_points.shift();
                    bottom_img_points.shift();
                    _left_img_points.reverse();
                    left_img_points = _left_img_points.flat(1);
                    left_img_points.shift();
                    left_img_points.shift();
                    left_img_points.pop();
                    left_img_points.pop();
                    console.log(top_img_points, right_img_points);
                    v_points = new Float32Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], top_points, true), right_points, true), bottom_points, true), left_points, true));
                    f_points = new Float32Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], top_img_points, true), right_img_points, true), bottom_img_points, true), left_img_points, true));
                    canvas2d_el = document.createElement("canvas");
                    canvas2d_el.width = width;
                    canvas2d_el.height = height;
                    ctx = canvas2d_el.getContext("2d");
                    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img_el, 0, 0, width, height);
                    canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    gl = canvas.getContext("webgl");
                    v_shader = gl === null || gl === void 0 ? void 0 : gl.createShader(gl.VERTEX_SHADER);
                    f_shader = gl === null || gl === void 0 ? void 0 : gl.createShader(gl.FRAGMENT_SHADER);
                    gl === null || gl === void 0 ? void 0 : gl.shaderSource(v_shader, v_shader_string);
                    gl === null || gl === void 0 ? void 0 : gl.shaderSource(f_shader, f_shader_string);
                    gl === null || gl === void 0 ? void 0 : gl.compileShader(v_shader);
                    gl === null || gl === void 0 ? void 0 : gl.compileShader(f_shader);
                    program = gl === null || gl === void 0 ? void 0 : gl.createProgram();
                    gl === null || gl === void 0 ? void 0 : gl.attachShader(program, v_shader);
                    gl === null || gl === void 0 ? void 0 : gl.attachShader(program, f_shader);
                    gl === null || gl === void 0 ? void 0 : gl.linkProgram(program);
                    console.error(gl === null || gl === void 0 ? void 0 : gl.getProgramInfoLog(program));
                    gl === null || gl === void 0 ? void 0 : gl.useProgram(program);
                    texture = gl === null || gl === void 0 ? void 0 : gl.createTexture();
                    gl === null || gl === void 0 ? void 0 : gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl === null || gl === void 0 ? void 0 : gl.activeTexture(gl.TEXTURE0);
                    gl === null || gl === void 0 ? void 0 : gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl === null || gl === void 0 ? void 0 : gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d_el);
                    gl === null || gl === void 0 ? void 0 : gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl === null || gl === void 0 ? void 0 : gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl === null || gl === void 0 ? void 0 : gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl === null || gl === void 0 ? void 0 : gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    u_sampler = gl === null || gl === void 0 ? void 0 : gl.getUniformLocation(program, "u_sampler");
                    gl === null || gl === void 0 ? void 0 : gl.uniform1i(u_sampler, 0);
                    vertex_buffer = gl === null || gl === void 0 ? void 0 : gl.createBuffer();
                    frag_buffer = gl === null || gl === void 0 ? void 0 : gl.createBuffer();
                    a_vertex_coords = gl === null || gl === void 0 ? void 0 : gl.getAttribLocation(program, "a_vertex_coords");
                    a_texture_coords = gl === null || gl === void 0 ? void 0 : gl.getAttribLocation(program, "a_texture_coords");
                    gl === null || gl === void 0 ? void 0 : gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
                    gl === null || gl === void 0 ? void 0 : gl.bufferData(gl.ARRAY_BUFFER, v_points, gl.STATIC_DRAW);
                    gl === null || gl === void 0 ? void 0 : gl.vertexAttribPointer(a_vertex_coords, 2, gl.FLOAT, false, v_points.BYTES_PER_ELEMENT * 2, 0);
                    gl === null || gl === void 0 ? void 0 : gl.enableVertexAttribArray(a_vertex_coords);
                    gl === null || gl === void 0 ? void 0 : gl.bindBuffer(gl.ARRAY_BUFFER, frag_buffer);
                    gl === null || gl === void 0 ? void 0 : gl.bufferData(gl.ARRAY_BUFFER, f_points, gl.STATIC_DRAW);
                    gl === null || gl === void 0 ? void 0 : gl.vertexAttribPointer(a_texture_coords, 2, gl.FLOAT, false, f_points.BYTES_PER_ELEMENT * 2, 0);
                    gl === null || gl === void 0 ? void 0 : gl.enableVertexAttribArray(a_texture_coords);
                    gl === null || gl === void 0 ? void 0 : gl.clearColor(1, 1, 1, 1.0);
                    gl === null || gl === void 0 ? void 0 : gl.clear(gl.COLOR_BUFFER_BIT);
                    gl === null || gl === void 0 ? void 0 : gl.drawArrays(gl === null || gl === void 0 ? void 0 : gl.TRIANGLE_FAN, 0, v_points.length / 2);
                    return [2 /*return*/, canvas.toDataURL()];
            }
        });
    });
}
fn(width, height, img_url, bezier_points);
exports.default = fn;
