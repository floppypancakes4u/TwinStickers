let colors;
const isNode = typeof process !== 'undefined' && process.release && process.release.name === 'node';

const loadColors = async () => {
    if (isNode) {
        colors = await import('colors');
    }
};

const colorsReady = loadColors();

function getTimestamp() {
    return new Date().toISOString();
}

export async function log(...args) {
    await colorsReady;  // Ensure the colors module is loaded

    let prepend;

    if (isNode && colors) {
        // Node.js environment
        prepend = `${colors.default.gray(getTimestamp())}`; // Use colors.default for dynamic import
    } else {
        // Web client environment
        prepend = `${getTimestamp()}`;
    }

    console.log(prepend, ...args);
}


// function getTimestamp() {
//     const date = new Date();
//     const month = date.getMonth() + 1;
//     const day = date.getDate();
//     const year = date.getFullYear().toString().slice(-2);
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const seconds = date.getSeconds();
//     const milliseconds = date.getMilliseconds();
  
//     return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}:${milliseconds}`;
// }