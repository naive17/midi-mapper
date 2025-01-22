export const rsqw = (t, delta = 0.01, a = 1, f = 1 / (2 * Math.PI)) => (a / Math.atan(1 / delta)) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
export const exp = (t) => 1 / (1 + t + 0.48 * t * t + 0.235 * t * t * t);
export const linear = (t) => t;
export const sine = {
    in: (x) => 1 - Math.cos((x * Math.PI) / 2),
    out: (x) => Math.sin((x * Math.PI) / 2),
    inOut: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
};
export const cubic = {
    in: (x) => x * x * x,
    out: (x) => 1 - Math.pow(1 - x, 3),
    inOut: (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
};
export const quint = {
    in: (x) => x * x * x * x * x,
    out: (x) => 1 - Math.pow(1 - x, 5),
    inOut: (x) => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2,
};
export const circ = {
    in: (x) => 1 - Math.sqrt(1 - Math.pow(x, 2)),
    out: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
    inOut: (x) => x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2,
};
export const quart = {
    in: (t) => t * t * t * t,
    out: (t) => 1 - --t * t * t * t,
    inOut: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
};
export const expo = {
    in: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
    out: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOut: (x) => x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? Math.pow(2, 20 * x - 10) / 2
                : (2 - Math.pow(2, -20 * x + 10)) / 2,
};
/**
 * Damp, based on Game Programming Gems 4 Chapter 1.10
 *   Return value indicates whether the animation is still running.
 */
export function damp(
/** The object */
current, 
/** The key to animate */
prop, 
/** To goal value */
target, 
/** Approximate time to reach the target. A smaller value will reach the target faster. */
smoothTime = 0.25, 
/** Frame delta, for refreshrate independence */
delta = 0.01, 
/** Optionally allows you to clamp the maximum speed. If smoothTime is 0.25s and looks OK
 *  going between two close points but not for points far apart as it'll move very rapid,
 *  then a maxSpeed of e.g. 1 which will clamp the speed to 1 unit per second, it may now
 *  take much longer than smoothTime to reach the target if it is far away. */
maxSpeed = Infinity, 
/** Easing function */
easing = exp, 
/** End of animation precision */
eps = 0.001) {
    const vel = "velocity_" + prop;
    if (current.__damp === undefined)
        current.__damp = {};
    if (current.__damp[vel] === undefined)
        current.__damp[vel] = 0;
    if (Math.abs(current[prop] - target) <= eps) {
        current[prop] = target;
        return false;
    }
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const t = easing(omega * delta);
    let change = current[prop] - target;
    const originalTo = target;
    // Clamp maximum maxSpeed
    const maxChange = maxSpeed * smoothTime;
    change = Math.min(Math.max(change, -maxChange), maxChange);
    target = current[prop] - change;
    const temp = (current.__damp[vel] + omega * change) * delta;
    current.__damp[vel] = (current.__damp[vel] - omega * temp) * t;
    let output = target + (change + temp) * t;
    // Prevent overshooting
    if (originalTo - current[prop] > 0.0 === output > originalTo) {
        output = originalTo;
        current.__damp[vel] = (output - originalTo) / delta;
    }
    current[prop] = output;
    return true;
}
export function damp2(current, target, smoothTime = 0.25, delta = 0.01, maxSpeed = Infinity, easing = exp, eps = 0.001) {
    damp(current, "x", target.x, smoothTime, delta, maxSpeed, easing, eps);
    damp(current, "y", target.y, smoothTime, delta, maxSpeed, easing, eps);
}
