
export function nextTick(runQueueFunc: (value: void) => void) {
    if ("Promise" in window && typeof Promise === "function") {
        Promise.resolve().then(runQueueFunc);
    } else {
        setTimeout(runQueueFunc, 0);
    }
}