export class SvgDumper {

    private svg: SVGSVGElement;
    private containerElements = ["svg", "g"];
    private embeddableStyles  = {
        "rect": ["fill", "stroke", "stroke-width"],
        "path": ["fill", "stroke", "stroke-width"],
        "circle": ["fill", "stroke", "stroke-width"],
        "line": ["stroke", "stroke-width"],
        "text": ["fill", "font-size", "text-anchor", "font-family"],
        "polygon": ["stroke", "fill"]
    };

    constructor(svg: SVGSVGElement) {
        this.svg = svg
    }

    dump(): string {
        const clone      = this.svg.cloneNode(true) as SVGSVGElement;
        const portLabels = clone.querySelectorAll(".port .label");

        for (const label of portLabels) {
            label.parentNode.removeChild(label);
        }

        this.treeShakeStyles(clone, this.svg);

        return new XMLSerializer().serializeToString(clone);

    }

    private treeShakeStyles(clone: SVGElement, original: SVGElement) {


        const children             = clone.childNodes;
        const originalChildrenData = original.childNodes as NodeListOf<SVGElement>;


        for (let childIndex = 0; childIndex < children.length; childIndex++) {

            const child   = children[childIndex] as SVGElement;
            const tagName = child.tagName;

            if (this.containerElements.indexOf(tagName) !== -1) {
                this.treeShakeStyles(child, originalChildrenData[childIndex]);
            } else if (tagName in this.embeddableStyles) {

                const styleDefinition = window.getComputedStyle(originalChildrenData[childIndex]);

                let styleString = "";
                for (let st = 0; st < this.embeddableStyles[tagName].length; st++) {
                    styleString +=
                        this.embeddableStyles[tagName][st]
                        + ":"
                        + styleDefinition.getPropertyValue(this.embeddableStyles[tagName][st])
                        + "; ";
                }

                child.setAttribute("style", styleString);
            }
        }
    }
}

