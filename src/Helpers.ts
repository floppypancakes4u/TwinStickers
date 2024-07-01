const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

// Define color and style codes for Node.js (ANSI escape codes) and browser (CSS styles)
const colors: { [key: string]: string } = {
    gray: isNode ? '\x1b[90m' : 'color: gray',
    white: isNode ? '\x1b[97m' : 'color: white',
    green: isNode ? '\x1b[92m' : 'color: green',
    blue: isNode ? '\x1b[94m' : 'color: blue',
    red: isNode ? '\x1b[91m' : 'color: red',
    orange: isNode ? '\x1b[38;5;214m' : 'color: orange', // Custom ANSI for orange
    yellow: isNode ? '\x1b[93m' : 'color: yellow',
    reset: isNode ? '\x1b[0m' : 'color: initial',

    bgGray: isNode ? '\x1b[100m' : 'background-color: gray',
    bgWhite: isNode ? '\x1b[107m' : 'background-color: white',
    bgGreen: isNode ? '\x1b[102m' : 'background-color: green',
    bgBlue: isNode ? '\x1b[104m' : 'background-color: blue',
    bgRed: isNode ? '\x1b[101m' : 'background-color: red',
    bgOrange: isNode ? '\x1b[48;5;214m' : 'background-color: orange', // Custom ANSI for bg orange

    underline: isNode ? '\x1b[4m' : 'text-decoration: underline',
    strikethrough: isNode ? '\x1b[9m' : 'text-decoration: line-through'
};


const getTimestamp = (): string => {
    const now = new Date();
    return now.toISOString();
};

// Define the type for the log level
interface LogLevel {
    text: string;
    style: keyof typeof colors;
}

const baseLog = (level: LogLevel, ...args: any[]): void => {
    // Prepend the timestamp with gray color
    const timestamp: LogLevel = { text: `${getTimestamp()}`, style: 'gray' };
    const side: LogLevel = { text: isNode ? "[SERVER]" : "[CLIENT]", style: isNode ? 'bgBlue' : 'bgGreen' };
    const levelStyle = level.style;

    if (isNode) {
        const formattedTimestamp = `${colors[timestamp.style]}${timestamp.text}${colors.reset}`;
        const formattedSide = `${colors[side.style]}${side.text}${colors.reset}`;
        const formattedLevel = `${colors[levelStyle]}${level.text}${colors.reset}`;
        console.log(formattedTimestamp, formattedSide, formattedLevel, ...args.map(arg => {
            if (typeof arg === 'object' && arg.text && arg.style) {
                return `${colors[arg.style]}${arg.text}${colors.reset}`;
            }
            return arg;
        }));
    } else {
        const timestampStyle = colors[timestamp.style];
        const sideStyle = colors[side.style];
        const levelCss = colors[levelStyle];
        const resetStyle = colors.reset;
        const messageParts = args.map(arg => {
            if (typeof arg === 'object' && arg.text && arg.style) {
                return [`%c${arg.text}`, colors[arg.style]];
            }
            return [arg];
        });
        const logArgs = [`%c${timestamp.text} %c${side.text}%c${" "}%c${level.text}`, timestampStyle, sideStyle, resetStyle, levelCss, ...messageParts.flat()];
        console.log(...logArgs);
    }
};

// Define logging levels and colorize function
export const log = {
    debug: (...args: any[]) => baseLog({ text: '[DEBUG]', style: 'gray' }, ...args),
    info: (...args: any[]) => baseLog({ text: '[INFO]', style: 'green' }, ...args),
    warning: (...args: any[]) => baseLog({ text: '[WARNING]', style: 'yellow' }, ...args),
    error: (...args: any[]) => baseLog({ text: '[ERROR]', style: 'red' }, ...args),
    critical: (...args: any[]) => baseLog({ text: '[CRITICAL]', style: 'bgOrange' }, ...args),
    hack: (...args: any[]) => baseLog({ text: '[CHEAT/HACK ATTEMPT]', style: 'bgRed' }, ...args),
    custom: (level: string, style: keyof typeof colors, ...args: any[]) => baseLog({ text: `[${level.toUpperCase()}]`, style }, ...args),

    colorize: (text: string, style: keyof typeof colors): string => {
        if (isNode) {
            return `${colors[style]}${text}${colors.reset}`;
        } else {
            return `%c${text}`; // Return text with a style placeholder for client-side
        }
    }
};

export interface Vector2d {
    x: number,
    y: number
}

export function distance(vectorjuan: Vector2d, victortwo: Vector2d): number {
    const dx = vectorjuan.x - victortwo.x;
    const dy = victortwo.y - victortwo.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function rgbToHex(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b;
}

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Example usage
// log.debug(`This is a ${log.colorize('debug message', 'blue')}`);
// log.info(`This is an ${log.colorize('info message', 'green')}`);
// log.warning(`This is a ${log.colorize('warning message', 'yellow')}`);
// log.error(`This is an ${log.colorize('error message', 'red')}`);
// log.critical(`This is a ${log.colorize('critical message', 'bgRed')}`);
// log.custom('custom', 'orange', `This is a ${log.colorize('custom message', 'orange')}`);
