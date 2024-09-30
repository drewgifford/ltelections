import * as utils from "./utils.js";
export default utils;

export function sum(arr, info) {
    if (!isArrayLike(arr)) error("sum() expects an array, received:", arr);
    var tot = 0,
        nan = 0,
        val;
    for (var i = 0, n = arr.length; i < n; i++) {
        val = arr[i];
        if (val) {
            tot += val;
        } else if (isNaN(val)) {
            nan++;
        }
    }
    if (info) {
        info.nan = nan;
    }
    return tot;
}

export function isArrayLike(obj) {
    if (!obj) return false;
    if (isArray(obj)) return true;
    if (isString(obj)) return false;
    if (obj.length === 0 || obj.length > 0) return true;
    return false;
}

export function isArray(obj) {
    return Array.isArray(obj);
}

export function isString(obj) {
    return obj != null && obj.toString === String.prototype.toString;
}


export function forEachProperty(o, func, ctx) {
    Object.keys(o).forEach(function(key) {
        func.call(ctx, o[key], key);
    });
}