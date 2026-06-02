let _isQuickAdd = false;
export const markQuickAdd = () => { _isQuickAdd = true; };
export const consumeQuickAdd = () => { const v = _isQuickAdd; _isQuickAdd = false; return v; };