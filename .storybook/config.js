import {configure} from "@storybook/angular";

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

function loadStories() {
    requireAll(require.context("../src/app", true, /\.story.ts$/));

}

configure(loadStories, module);
