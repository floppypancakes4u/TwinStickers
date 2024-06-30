export const MathHelper = {
    DegToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    RadToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    Angle: {
        Wrap(angle) {
            while (angle > Math.PI)
                angle -= 2 * Math.PI;
            while (angle < -Math.PI)
                angle += 2 * Math.PI;
            return angle;
        }
    },
    Clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};
//# sourceMappingURL=MathHelper.js.map