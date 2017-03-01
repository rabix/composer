import {Injectable} from "@angular/core";

import {MarkdownIt} from "markdown-it";
import * as MarkDownIt from "markdown-it";
import * as LazyHeaders from "markdown-it-lazy-headers";


@Injectable()
export class MarkDownService {

    private markDownIt : MarkdownIt;

    constructor() {
        // using markdown-it-lazy-headers plugin so you don't have
        // to follow the opening sequence of # characters by a space
        this.markDownIt = (new MarkDownIt()).use(LazyHeaders);
    }

    parse(markdown: string) {
        return this.markDownIt.render(markdown);
    }
}
