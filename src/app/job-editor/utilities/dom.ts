export function findParentInputOfType(el: Element, type: string): Element | undefined {
    while (el) {

        const isInput     = el.classList.contains("input");
        const isType      = el.classList.contains(`type-${type}`);
        const isArrayType = el.classList.contains(`type-array`) && el.classList.contains(`items-${type}`);

        if (isInput && (isType || isArrayType)) {
            return el;
        }

        el = el.parentElement;
    }

    return el;
}
