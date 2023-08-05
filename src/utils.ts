function loadImage(url: string): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise((res) => {
        img.addEventListener("load", res.bind(null, img));
        img.src = url;
    });
}

function is_out_range(x: number, y: number, start_x: number, end_x: number, start_y: number, end_y: number): boolean {
    return x < start_x || x > end_x || y < start_y || y > end_y;
}

function cz(rate: number, start: number, end: number): number {
    return Math.floor((1 - rate) * start + rate * end);
}
export { loadImage, is_out_range, cz };
