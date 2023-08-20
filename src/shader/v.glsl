attribute vec2 a_texture_coords;
attribute vec2 a_vertex_coords;
varying vec2 v_texture_coords;

void main(){
    v_texture_coords = a_texture_coords;
    gl_Position = vec4(a_vertex_coords,0,1);
}