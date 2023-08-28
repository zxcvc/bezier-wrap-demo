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
var THREE = require("three");
var three_1 = require("three");
var utils_ts_1 = require("../utils.ts");
var width = 1048;
var height = 1200;
var img_url = "/6.webp";
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
function fn(width, height, img_url, bezier_points) {
    return __awaiter(this, void 0, void 0, function () {
        var renderer, scene, camera, points, shape;
        return __generator(this, function (_a) {
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(width, height);
            scene = new THREE.Scene();
            camera = new THREE.OrthographicCamera(0, width, 0, -height);
            camera.position.set(0, 0, 2);
            points = (0, utils_ts_1.pointHandler)(bezier_points);
            shape = new THREE.Shape();
            points.forEach(function (item) {
                shape
                    .moveTo(item[0].x, -item[0].y)
                    .bezierCurveTo(item[1].x, -item[1].y, item[2].x, -item[2].y, item[3].x, -item[3].y);
            });
            return [2 /*return*/, new Promise(function (res, rej) {
                    new THREE.TextureLoader().load(img_url, function (texture) {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        // texture.wrapS = THREE.RepeatWrapping;
                        // texture.wrapT = THREE.RepeatWrapping;
                        var geometry = new THREE.ShapeGeometry(shape, 20);
                        var position = geometry.attributes.position.array;
                        var material = new THREE.MeshBasicMaterial({ map: texture, wireframe: false });
                        var uv = new Float32Array(position.length);
                        var length_peer_b = position.length / 4;
                        for (var s = 0; s < 4; ++s) {
                            var start = s * length_peer_b;
                            for (var i = 0; i + 2 < length_peer_b; i += 3) {
                                switch (s) {
                                    case 0: {
                                        var x = i / length_peer_b;
                                        var y = 1;
                                        var z = 0;
                                        uv[i + start] = x;
                                        uv[i + start + 1] = y;
                                        uv[i + start + 2] = z;
                                        break;
                                    }
                                    case 1: {
                                        var x = 1;
                                        var y = (length_peer_b - i) / length_peer_b;
                                        var z = 0;
                                        uv[i + start] = x;
                                        uv[i + start + 1] = y;
                                        uv[i + start + 2] = z;
                                        break;
                                    }
                                    case 2: {
                                        var x = (length_peer_b - i) / length_peer_b;
                                        var y = 0;
                                        var z = 0;
                                        uv[i + start] = x;
                                        uv[i + start + 1] = y;
                                        uv[i + start + 2] = z;
                                        break;
                                    }
                                    case 3: {
                                        var x = 0;
                                        var y = i / length_peer_b;
                                        var z = 0;
                                        uv[i + start] = x;
                                        uv[i + start + 1] = y;
                                        uv[i + start + 2] = z;
                                        break;
                                    }
                                }
                            }
                        }
                        geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 3));
                        var mesh = new three_1.Mesh(geometry, material);
                        scene.add(mesh);
                        renderer.render(scene, camera);
                        res(renderer.domElement.toDataURL());
                    });
                })];
        });
    });
}
// console.time("1");
// const url = await fn(width, height, img_url, bezier_points);
// const img = document.createElement("img");
// img.src = url;
// document.body.append(img);
// console.timeEnd("1");
exports.default = fn;
