declare let cv: any;

declare class Utils {
    loadOpenCv(cb: Function);
}

declare module "*.glsl" {
    const source: string;
    export default source;
}
