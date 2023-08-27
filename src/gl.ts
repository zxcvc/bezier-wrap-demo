const width = 1048;
const height = 1200;
const ERROR_MARGIN = 0.001;
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

import { createBezier, loadImage, binary_search, interpolation, gs_length } from "./utils.ts";
import { Bezier, Point } from "bezier-js";
let img_url = "/6.webp";

async function fn(width: number, height: number, imgurl: string, bezier_points: Array<Point>) {
    let v_shader_string = `
    attribute vec2 a_texture_coords;
    attribute vec2 a_vertex_coords;
    varying vec2 v_texture_coords;
    
    void main(){
        v_texture_coords = a_texture_coords;
        gl_PointSize = 1.0;
        gl_Position = vec4(a_vertex_coords,0,1);
    }
    `;
    let f_shader_string = `precision mediump float;
    varying vec2 v_texture_coords;
    uniform sampler2D u_sampler;
    
    void main(){
        gl_FragColor = texture2D(u_sampler,v_texture_coords);
    }`;
    let img_el = await loadImage(imgurl);

    const [top_bezier, right_bezier, bottom_bezier, left_bezier] = createBezier(bezier_points);
    const top_length = Math.floor(gs_length(top_bezier, 1));
    const right_length = Math.floor(gs_length(right_bezier, 1));
    const bottom_length = Math.floor(gs_length(bottom_bezier, 1));
    const left_length = Math.floor(gs_length(left_bezier, 1));
    console.log(top_length, right_length, bottom_length, left_length);
    console.time("length");
    for (let i = 0; i < 10000; ++i) {
        top_bezier.length();
    }
    console.timeEnd("length");
    console.time("gs_length");
    for (let i = 0; i < 10000; ++i) {
        const length = gs_length(top_bezier, 1);
        const t = binary_search(gs_length.bind(null, top_bezier), length, 0, 1, ERROR_MARGIN);
    }
    console.timeEnd("gs_length");
    // return;

    console.log(top_bezier.length(), gs_length(top_bezier, 1));
    console.log(binary_search(gs_length.bind(null, top_bezier), 500, 0, 1, ERROR_MARGIN));

    const _top_points = top_bezier.getLUT(top_length - 1).map((item, index) => {
        const t = binary_search(gs_length.bind(null, top_bezier), index, 0, 1, ERROR_MARGIN);

        item = top_bezier.compute(t);
        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
    });
    const _right_points = right_bezier.getLUT(right_length - 1).map((item, index) => {
        const t = binary_search(gs_length.bind(null, right_bezier), index, 0, 1, ERROR_MARGIN);
        item = right_bezier.compute(t);
        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
    });
    const _bottom_points = bottom_bezier.getLUT(bottom_length - 1).map((item, index) => {
        const t = binary_search(gs_length.bind(null, bottom_bezier), index, 0, 1, ERROR_MARGIN);
        item = bottom_bezier.compute(t);
        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
    });
    const _left_points = left_bezier.getLUT(left_length - 1).map((item, index) => {
        const t = binary_search(gs_length.bind(null, left_bezier), index, 0, 1, ERROR_MARGIN);
        item = left_bezier.compute(t);
        return [((item.x - width / 2) / width) * 2, ((item.y - height / 2) / height) * -2];
    });

    _right_points.reverse();
    _top_points.reverse();
    _top_points.pop();
    _right_points.pop();
    _bottom_points.pop();
    _left_points.pop();
    const top_points = _top_points.flat(1);
    const right_points = _right_points.flat(1);
    const bottom_points = _bottom_points.flat(1);
    const left_points = _left_points.flat(1);

    const top_arr = new Array(top_length).fill(0);
    const right_arr = new Array(right_length).fill(0);
    const bottom_arr = new Array(bottom_length).fill(0);
    const left_arr = new Array(left_length).fill(0);

    const _top_img_points = top_arr.map((item, index) => [(index - 0) / (top_length - 1), 1]);
    const _right_img_points = right_arr.map((item, index) => [1, (right_length - 1 - index) / (right_length - 1)]);
    const _bottom_img_points = bottom_arr.map((item, index) => [(index - 0) / (bottom_length - 1), 0]);
    const _left_img_points = left_arr.map((item, index) => [0, (left_length - 1 - index) / (left_length - 1)]);
    _top_img_points.pop();
    _right_img_points.pop();
    _bottom_img_points.pop();
    _left_img_points.pop();
    _top_img_points.reverse();
    _right_img_points.reverse();
    const top_img_points = _top_img_points.flat(1);
    const right_img_points = _right_img_points.flat(1);
    const bottom_img_points = _bottom_img_points.flat(1);
    const left_img_points = _left_img_points.flat(1);

    const top_mid = _top_points[top_length >> 1];
    const bottom_mid = _bottom_points[bottom_length >> 1];
    const left_mid = _left_points[left_length >> 1];
    const right_mid = _right_points[right_length >> 1];
    const { y } = interpolation(0.5, { x: top_mid[0], y: top_mid[1] }, { x: bottom_mid[0], y: bottom_mid[1] });
    const { x } = interpolation(0.5, { x: left_mid[0], y: left_mid[1] }, { x: right_mid[0], y: right_mid[1] });
    const v_points = new Float32Array([...left_points, ...bottom_points, ...right_points, ...top_points]);
    const f_points = new Float32Array([
        ...left_img_points,
        ...bottom_img_points,
        ...right_img_points,
        ...top_img_points,
    ]);
    console.log(v_points, f_points);
    const canvas2d_el = document.createElement("canvas");
    canvas2d_el.width = width;
    canvas2d_el.height = height;
    const ctx = canvas2d_el.getContext("2d");
    ctx?.drawImage(img_el, 0, 0, width, height);

    const canvas: HTMLCanvasElement = document.createElement("canvas")!;
    canvas.width = width;
    canvas.height = height;
    document.body.append(canvas);
    const gl = canvas.getContext("webgl")!;
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
    gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas2d_el);
    gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

    gl?.drawArrays(gl?.TRIANGLE_FAN, 0, v_points.length / 2);
    return canvas.toDataURL();
}

fn(width, height, img_url, bezier_points);
export default fn;
