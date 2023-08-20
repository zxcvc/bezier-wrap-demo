console.time("1");
const width = 1048;
const height = 1200;
import v_shader_string from "./shader/v.glsl";
import f_shader_string from "./shader/f.glsl";

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

import { createBezier, loadImage } from "./utils";
let img_url = "/6.webp";
let img_el = await loadImage(img_url);

const [top_bezier, right_bezier, bottom_bezier, left_bezier] = createBezier(bezier_points);
const _top_points = top_bezier.getLUT(width).map((item, index) => {
    return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
});
const _right_points = right_bezier.getLUT(height).map((item, index) => {
    return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
});
const _bottom_points = bottom_bezier.getLUT(width).map((item, index) => {
    return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
});
const _left_points = left_bezier.getLUT(height).map((item, index) => {
    return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
});
// top_points.pop();
// top_points.pop();
const top_points = _top_points.flat(1);
const right_points = _right_points.flat(1);
right_points.shift();
right_points.shift();

_bottom_points.reverse();
const bottom_points = _bottom_points.flat(1);
bottom_points.shift();
bottom_points.shift();

_left_points.reverse();
const left_points = _left_points.flat(1);

left_points.pop();
left_points.pop();
left_points.shift();
left_points.shift();

const width_arr = new Array(width + 1).fill(0);
const height_arr = new Array(height + 1).fill(0);

const _top_img_points = width_arr.map((item, index) => [(index - 0) / width, 1]);
const _right_img_points = height_arr.map((item, index) => [1, (height - index) / height]);
const _bottom_img_points = width_arr.map((item, index) => [(index - 0) / width, 0]);
const _left_img_points = height_arr.map((item, index) => [0, (height - index) / height]);
// console.log(top_points, top_img_points);

const top_img_points = _top_img_points.flat(1);

const right_img_points = _right_img_points.flat(1);
right_img_points.shift();
right_img_points.shift();

_bottom_img_points.reverse();
const bottom_img_points = _bottom_img_points.flat(1);
bottom_img_points.shift();
bottom_img_points.shift();

_left_img_points.reverse();
const left_img_points = _left_img_points.flat(1);

left_img_points.shift();
left_img_points.shift();
left_img_points.pop();
left_img_points.pop();

const v_points = new Float32Array([...top_points, ...right_points, ...bottom_points, ...left_points]);
const f_points = new Float32Array([...top_img_points, ...right_img_points, ...bottom_img_points, ...left_img_points]);
const canvas2d_el = document.createElement("canvas");
canvas2d_el.width = width;
canvas2d_el.height = height;
const ctx = canvas2d_el.getContext("2d");
ctx?.drawImage(img_el, 0, 0, width, height);
img_url = canvas2d_el.toDataURL();
img_el = await loadImage(img_url);
// document.querySelector("img").src = img_url;
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
canvas.width = width;
canvas.height = height;
const gl = canvas.getContext("webgl");
const v_shader = gl?.createShader(gl.VERTEX_SHADER)!;
const f_shader = gl?.createShader(gl.FRAGMENT_SHADER)!;
gl?.shaderSource(v_shader, v_shader_string);
gl?.shaderSource(f_shader, f_shader_string);
gl?.compileShader(v_shader);
gl?.compileShader(f_shader);
const program = gl?.createProgram()!;
gl?.attachShader(program, v_shader);
gl?.attachShader(program, f_shader);
gl?.linkProgram(program);
console.error(gl?.getProgramInfoLog(program));
gl?.useProgram(program);

const texture = gl?.createTexture()!;
gl?.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl?.activeTexture(gl.TEXTURE0);
gl?.bindTexture(gl.TEXTURE_2D, texture);
gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img_el);
gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const u_sampler = gl?.getUniformLocation(program, "u_sampler")!;
gl?.uniform1i(u_sampler, 0);

const vertex_buffer = gl?.createBuffer()!;
const frag_buffer = gl?.createBuffer()!;
const a_vertex_coords = gl?.getAttribLocation(program, "a_vertex_coords")!;
const a_texture_coords = gl?.getAttribLocation(program, "a_texture_coords")!;

gl?.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl?.bufferData(gl.ARRAY_BUFFER, v_points, gl.STATIC_DRAW);
gl?.vertexAttribPointer(a_vertex_coords, 2, gl.FLOAT, false, v_points.BYTES_PER_ELEMENT * 2, 0);
gl?.enableVertexAttribArray(a_vertex_coords);

gl?.bindBuffer(gl.ARRAY_BUFFER, frag_buffer);
gl?.bufferData(gl.ARRAY_BUFFER, f_points, gl.STATIC_DRAW);
gl?.vertexAttribPointer(a_texture_coords, 2, gl.FLOAT, false, f_points.BYTES_PER_ELEMENT * 2, 0);
gl?.enableVertexAttribArray(a_texture_coords);

gl?.clearColor(1, 1, 1, 1.0);
gl?.clear(gl.COLOR_BUFFER_BIT);

gl?.drawArrays(gl?.TRIANGLE_FAN, 0, v_points.length / 2 - 1);
console.timeEnd("1");
