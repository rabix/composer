import {Injectable} from "@angular/core";

import * as Markdown from "markdown-it";
import {MarkdownIt} from "markdown-it";
import * as LazyHeaders from "markdown-it-lazy-headers";


@Injectable()
export class MarkdownService {

    private markDownIt: MarkdownIt;

    constructor() {
        // using markdown-it-lazy-headers plugin so you don't have
        // to follow the opening sequence of # characters by a space
        this.markDownIt = (new Markdown()).use(LazyHeaders);
    }

    parse(markdown: string) {
        try {
            return this.markDownIt.render(markdown);
        } catch (err) {
            return "";
        }
    }
}
