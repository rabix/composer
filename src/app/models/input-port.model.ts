/** Change the type when we have the models imported */
export class InputPort {
    public id: string;
    public type: string;
    public value: string;

    constructor(attr: {
        id: string;
        type: string;
        value: string;
    }) {
        this.id = attr.id;
        this.type = attr.type;
        this.value = attr.value;
    }
}
