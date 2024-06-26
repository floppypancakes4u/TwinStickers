precision mediump float;

uniform float uHeat;
uniform vec2 uResolution;
uniform sampler2D uSampler;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec4 color = texture2D(uSampler, uv);

    // Interpolate between the asteroid's color and a red color based on heat
    vec3 baseColor = color.rgb;
    vec3 heatedColor = vec3(1.0, 0.0, 0.0); // Red color

    vec3 finalColor = mix(baseColor, heatedColor, uHeat);

    gl_FragColor = vec4(finalColor, color.a);
}
