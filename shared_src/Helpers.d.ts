declare const colors: {
    [key: string]: string;
};
export declare const log: {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warning: (...args: any[]) => void;
    error: (...args: any[]) => void;
    critical: (...args: any[]) => void;
    hack: (...args: any[]) => void;
    custom: (level: string, style: keyof typeof colors, ...args: any[]) => void;
    colorize: (text: string, style: keyof typeof colors) => string;
};
export interface Vector2d {
    x: number;
    y: number;
}
export declare function distance(vectorjuan: Vector2d, victortwo: Vector2d): number;
export declare function rgbToHex(r: number, g: number, b: number): number;
export declare function getRandomInt(min: number, max: number): number;
export declare function degToRad(degrees: number): number;
export {};
