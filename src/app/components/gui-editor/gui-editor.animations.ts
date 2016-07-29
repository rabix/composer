import {
    trigger,
    state,
    style,
    transition,
    animate
} from "@angular/core";

export const GuiEditorAnimations = [
    trigger("commandlineState", [
        state("visible", style({
            height: 70,
            display: "block",
            overflowY: "auto"
        })),
        state("hidden", style({
            height: 20,
            display: "none",
            overflowY: "hidden"
        })),
        transition("hidden => visible", animate("100ms ease-in")),
        transition("visible => hidden", animate("100ms ease-out"))
    ]),
    trigger("sidebarState", [
        state("visible", style({
            width: '40%',
            display: 'block',
            overflowY: "auto"
        })),
        state("hidden", style({
            width: '10%',
            display: 'none',
            overflowY: "hidden"
        })),
        transition("hidden => visible", animate("100ms ease-in")),
        transition("visible => hidden", animate("100ms ease-out"))
    ]),
    trigger("propertyPosition", [
        state("left", style({
            margin: '20px 0 0 0'
        })),
        state("center", style({
            margin: '20px auto'
        })),
        transition("hidden => visible", animate("100ms ease-in")),
        transition("visible => hidden", animate("100ms ease-out"))
    ])
];
