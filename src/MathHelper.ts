export const MathHelper = {
    DegToRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    },
    
    RadToDeg(radians: number): number {
        return radians * (180 / Math.PI);
    },
    
    Angle: {
        Wrap(angle: number): number {
            while (angle > Math.PI) angle -= 2 * Math.PI;
            while (angle < -Math.PI) angle += 2 * Math.PI;
            return angle;
        }
    },
    
    Clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
};
