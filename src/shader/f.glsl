precision mediump float;
varying vec2 v_texture_coords;
uniform sampler2D u_sampler;

void main(){
    gl_FragColor = texture2D(u_sampler,v_texture_coords);
}