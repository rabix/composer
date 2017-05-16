import {
    AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Workflow} from "cwl-svg";
import {
    StepModel,
    WorkflowFactory,
    WorkflowInputParameterModel,
    WorkflowModel,
    WorkflowOutputParameterModel
} from "cwlts/models";
import {DataGatewayService} from "../../../core/data-gateway/data-gateway.service";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import LoadOptions = jsyaml.LoadOptions;
import {IpcService} from "../../../services/ipc.service";
import {WorkflowEditorService} from "../../workflow-editor.service";


@Component({
    selector: "ct-workflow-graph-editor",
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["./workflow-graph-editor.component.scss"],
    template: `
        <svg *ngIf="model.steps.length === 0" class="svg-graph-empty-state" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 434.06 173.5">
            <g id="Layer_3" data-name="Layer 3">
                <path d="M27.5,68.5s2.43-.14,7-.22" transform="translate(-27.44 -58)"
                      style="fill:none;stroke:#d3d3d3;stroke-miterlimit:10;stroke-width:2px"/>
                <path d="M48.26,68.27C86.48,68.84,172.74,74.63,267,111c92.29,35.61,153.16,83.1,179.54,106.39"
                      transform="translate(-27.44 -58)"
                      style="fill:none;stroke:#d3d3d3;stroke-miterlimit:10;stroke-width:2px;stroke-dasharray:13.768009185791016,13.768009185791016"/>
                <path d="M451.66,222c2,1.84,3.71,3.44,5.1,4.79" transform="translate(-27.44 -58)"
                      style="fill:none;stroke:#d3d3d3;stroke-miterlimit:10;stroke-width:2px"/>
                <polygon points="424.12 169.6 428.28 167.87 429.92 163.67 434.06 173.5 424.12 169.6" style="fill:#d3d3d3"/>
            </g>
            <g id="tool">
                <g id="Layer_5_copy" data-name="Layer 5 copy">
                    <g id="Layer_2_copy_3" data-name="Layer 2 copy 3">
                        <circle cx="208.56" cy="41" r="28.49" style="fill:#d3d3d3"/>
                    </g>
                    <g id="Layer_2_copy_3-2" data-name="Layer 2 copy 3-2">
                        <path
                            d="M236,140a41,41,0,1,1,41-41h0A41,41,0,0,1,236,140Zm0-77.83A36.83,36.83,0,1,0,272.83,99,36.83,36.83,0,0,0,236,62.17Z"
                            transform="translate(-27.44 -58)" style="fill:#d3d3d3"/>
                    </g>
                </g>
                <rect x="210.52" y="52.55" width="12.48" height="2.89" style="fill:#fff"/>
                <rect x="219.59" y="91.34" width="20.42" height="2.89" transform="translate(105.47 -193.31) rotate(45)" style="fill:#fff"/>
                <rect x="219.59" y="103.76" width="20.42" height="2.89" transform="translate(439.24 -40.89) rotate(135)" style="fill:#fff"/>
            </g>
            <g id="Layer_4" data-name="Layer 4">
                <g id="Layer_7" data-name="Layer 7">
                    <polygon
                        points="216.25 86.34 212.23 78.3 212.23 69.46 214.71 68.24 215.45 66.24 216.25 62.22 218.67 62.22 219.47 62.22 221.08 60.61 223.49 59.8 224.3 61.41 225.1 63.02 227.72 62.22 229.93 63.83 229.93 66.24 230.73 66.24 233.48 66.17 234.75 68.65 234.75 71.87 233.95 78.3 233.15 83.93 231.54 86.34 229.93 87.15 216.25 86.34"
                        style="fill:#fff"/>
                </g>
                <path
                    d="M259.63,122.89a3.31,3.31,0,0,0-1.41.32v-.7a3.4,3.4,0,0,0-3.37-3.42,3.31,3.31,0,0,0-1.55.38,3.36,3.36,0,0,0-6.37-.3,3.32,3.32,0,0,0-1.65-.44,3.4,3.4,0,0,0-3.37,3.42v3.18h-.51a2.73,2.73,0,0,0-2.72,1.85,7.44,7.44,0,0,0-.32,2.57c0,2.88,0,7.22,2.18,11.3.58,1.09,2.39,4.43,2.41,4.47a1,1,0,0,0,.86.51h15.47a1,1,0,0,0,.93-.68c.11-.36,2.81-8.84,2.81-11.95v-7.09A3.4,3.4,0,0,0,259.63,122.89Zm-12.94,2.46a1,1,0,0,0,2,0v-4.92a1.41,1.41,0,1,1,2.82,0V127a1,1,0,1,0,2,0V122.5a1.41,1.41,0,1,1,2.82,0v6.06a1,1,0,0,0,2,0v-2.26a1.41,1.41,0,1,1,2.82,0v7.09c0,2.13-1.64,7.9-2.5,10.67H244.38l-2.13-3.94c-1.95-3.65-1.95-7.54-1.95-10.38,0-2.11.32-2.45,1.08-2.45h.51v4.37a1,1,0,1,0,2,0v-9.52a1.41,1.41,0,1,1,2.83,0v3.2Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
            </g>
            <g id="Layer_8" data-name="Layer 8">
                <path
                    d="M140.3,169V157.55h3.95a9.57,9.57,0,0,1,2,.16,3.89,3.89,0,0,1,1.68.82,4.67,4.67,0,0,1,1.36,2,7.69,7.69,0,0,1,.45,2.72,8,8,0,0,1-.3,2.31,5.62,5.62,0,0,1-.78,1.67,4.15,4.15,0,0,1-1,1,4.24,4.24,0,0,1-1.37.57,7.8,7.8,0,0,1-1.84.2Zm1.52-1.35h2.45a5.94,5.94,0,0,0,1.78-.21,2.54,2.54,0,0,0,1-.59,3.61,3.61,0,0,0,.84-1.45,7.09,7.09,0,0,0,.3-2.21,5.33,5.33,0,0,0-.59-2.76,3,3,0,0,0-1.43-1.29,5.93,5.93,0,0,0-2-.23h-2.41Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M151.66,169v-8.3h1.27V162a3.43,3.43,0,0,1,.89-1.16,1.56,1.56,0,0,1,.9-.28,2.75,2.75,0,0,1,1.45.45l-.48,1.3a2,2,0,0,0-1-.3,1.34,1.34,0,0,0-.83.28,1.5,1.5,0,0,0-.52.77,5.48,5.48,0,0,0-.23,1.64V169Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M162.41,168a5.24,5.24,0,0,1-1.5.94,4.35,4.35,0,0,1-1.55.27,3,3,0,0,1-2.1-.67,2.2,2.2,0,0,1-.73-1.71,2.31,2.31,0,0,1,1-1.92,3.42,3.42,0,0,1,1-.46,10.09,10.09,0,0,1,1.25-.21,12.85,12.85,0,0,0,2.51-.48c0-.19,0-.31,0-.37a1.55,1.55,0,0,0-.4-1.21,2.36,2.36,0,0,0-1.6-.48,2.49,2.49,0,0,0-1.46.35,2.12,2.12,0,0,0-.7,1.23l-1.37-.19a3.41,3.41,0,0,1,.62-1.43,2.7,2.7,0,0,1,1.24-.84,5.54,5.54,0,0,1,1.88-.29,5,5,0,0,1,1.73.25,2.28,2.28,0,0,1,1,.63,2.22,2.22,0,0,1,.44,1,7.92,7.92,0,0,1,.07,1.3v1.88a19.86,19.86,0,0,0,.09,2.48,3.11,3.11,0,0,0,.36,1H162.7A3,3,0,0,1,162.41,168Zm-.12-3.14a10.3,10.3,0,0,1-2.3.53,5.33,5.33,0,0,0-1.23.28,1.22,1.22,0,0,0-.55.46,1.24,1.24,0,0,0,.23,1.61,1.83,1.83,0,0,0,1.25.38,2.9,2.9,0,0,0,1.45-.36,2.19,2.19,0,0,0,.93-1,3.4,3.4,0,0,0,.23-1.41Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M165.64,169.69l1.37.2a1.3,1.3,0,0,0,.48.92,2.34,2.34,0,0,0,1.43.39,2.51,2.51,0,0,0,1.51-.39,1.92,1.92,0,0,0,.72-1.09,9,9,0,0,0,.1-1.8,2.89,2.89,0,0,1-2.3,1.09,3.13,3.13,0,0,1-2.65-1.23,4.75,4.75,0,0,1-.94-3,5.51,5.51,0,0,1,.43-2.19,3.44,3.44,0,0,1,1.25-1.55,3.37,3.37,0,0,1,1.92-.55,3,3,0,0,1,2.42,1.19v-1h1.3v7.17a6.81,6.81,0,0,1-.39,2.75A2.89,2.89,0,0,1,171,171.9a4.33,4.33,0,0,1-2.11.47,4,4,0,0,1-2.4-.67A2.26,2.26,0,0,1,165.64,169.69Zm1.16-5a3.6,3.6,0,0,0,.65,2.38,2.14,2.14,0,0,0,3.25,0,3.48,3.48,0,0,0,.66-2.34,3.4,3.4,0,0,0-.68-2.3,2.09,2.09,0,0,0-1.63-.77,2,2,0,0,0-1.59.76A3.38,3.38,0,0,0,166.8,164.7Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M184.66,168a5.24,5.24,0,0,1-1.5.94,4.35,4.35,0,0,1-1.55.27,3,3,0,0,1-2.1-.67,2.2,2.2,0,0,1-.73-1.71,2.31,2.31,0,0,1,1-1.92,3.42,3.42,0,0,1,1-.46,10.09,10.09,0,0,1,1.25-.21,12.85,12.85,0,0,0,2.51-.48c0-.19,0-.31,0-.37a1.55,1.55,0,0,0-.4-1.21,2.36,2.36,0,0,0-1.6-.48,2.49,2.49,0,0,0-1.46.35,2.12,2.12,0,0,0-.7,1.23l-1.37-.19a3.41,3.41,0,0,1,.62-1.43,2.7,2.7,0,0,1,1.24-.84,5.54,5.54,0,0,1,1.88-.29,5,5,0,0,1,1.73.25,2.28,2.28,0,0,1,1,.63,2.22,2.22,0,0,1,.44,1,7.92,7.92,0,0,1,.07,1.3v1.88a19.86,19.86,0,0,0,.09,2.48,3.11,3.11,0,0,0,.36,1h-1.47A3,3,0,0,1,184.66,168Zm-.12-3.14a10.3,10.3,0,0,1-2.3.53,5.33,5.33,0,0,0-1.23.28,1.22,1.22,0,0,0-.55.46,1.24,1.24,0,0,0,.23,1.61,1.83,1.83,0,0,0,1.25.38,2.9,2.9,0,0,0,1.45-.36,2.19,2.19,0,0,0,.93-1,3.4,3.4,0,0,0,.23-1.41Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M188.14,172.18V160.7h1.28v1.08a3.15,3.15,0,0,1,1-.95,2.81,2.81,0,0,1,1.38-.32,3.28,3.28,0,0,1,1.88.55,3.36,3.36,0,0,1,1.23,1.54,5.64,5.64,0,0,1,.41,2.18,5.55,5.55,0,0,1-.46,2.29,3.47,3.47,0,0,1-3.16,2.11,2.65,2.65,0,0,1-1.26-.3,2.86,2.86,0,0,1-.92-.75v4Zm1.27-7.28a3.61,3.61,0,0,0,.65,2.37,2,2,0,0,0,1.57.77,2,2,0,0,0,1.61-.79,3.76,3.76,0,0,0,.67-2.46,3.67,3.67,0,0,0-.65-2.37,2,2,0,0,0-1.56-.79,2,2,0,0,0-1.59.84A3.76,3.76,0,0,0,189.41,164.9Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M197,172.18V160.7h1.28v1.08a3.15,3.15,0,0,1,1-.95,2.81,2.81,0,0,1,1.38-.32,3.28,3.28,0,0,1,1.88.55,3.36,3.36,0,0,1,1.23,1.54,5.64,5.64,0,0,1,.41,2.18,5.55,5.55,0,0,1-.46,2.29,3.47,3.47,0,0,1-3.16,2.11,2.65,2.65,0,0,1-1.26-.3,2.86,2.86,0,0,1-.92-.75v4Zm1.27-7.28a3.61,3.61,0,0,0,.65,2.37,2,2,0,0,0,1.57.77,2,2,0,0,0,1.61-.79,3.76,3.76,0,0,0,.67-2.46,3.67,3.67,0,0,0-.65-2.37,2,2,0,0,0-1.56-.79,2,2,0,0,0-1.59.84A3.76,3.76,0,0,0,198.31,164.9Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M205.38,166.52l1.39-.22a1.94,1.94,0,0,0,.65,1.28,2.27,2.27,0,0,0,1.5.45,2.2,2.2,0,0,0,1.44-.39,1.18,1.18,0,0,0,.47-.93.86.86,0,0,0-.41-.75,6.11,6.11,0,0,0-1.44-.48,13.07,13.07,0,0,1-2.14-.68,2,2,0,0,1-1.21-1.9,2.14,2.14,0,0,1,.25-1,2.27,2.27,0,0,1,.69-.79,2.91,2.91,0,0,1,.89-.41,4.26,4.26,0,0,1,1.21-.17,4.8,4.8,0,0,1,1.71.28,2.33,2.33,0,0,1,1.09.76,3,3,0,0,1,.48,1.29l-1.37.19a1.51,1.51,0,0,0-.54-1,2,2,0,0,0-1.27-.36,2.3,2.3,0,0,0-1.38.32.93.93,0,0,0-.41.75.77.77,0,0,0,.17.49,1.23,1.23,0,0,0,.54.38q.21.08,1.24.36a17.38,17.38,0,0,1,2.08.65,2.12,2.12,0,0,1,.93.74,2.06,2.06,0,0,1,.34,1.2,2.36,2.36,0,0,1-.41,1.32,2.65,2.65,0,0,1-1.18,1,4.31,4.31,0,0,1-1.75.34,3.9,3.9,0,0,1-2.46-.67A3.12,3.12,0,0,1,205.38,166.52Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M218.72,169v-7.2h-1.24V160.7h1.24v-.88a3.86,3.86,0,0,1,.15-1.24,1.8,1.8,0,0,1,.71-.89,2.58,2.58,0,0,1,1.43-.34,6.89,6.89,0,0,1,1.31.14l-.21,1.23a4.75,4.75,0,0,0-.83-.08,1.23,1.23,0,0,0-.91.27,1.48,1.48,0,0,0-.27,1v.77h1.62v1.09h-1.62V169Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M222.81,169v-8.3h1.27V162a3.43,3.43,0,0,1,.89-1.16,1.56,1.56,0,0,1,.9-.28,2.75,2.75,0,0,1,1.45.45l-.48,1.3a2,2,0,0,0-1-.3,1.34,1.34,0,0,0-.83.28,1.5,1.5,0,0,0-.52.77,5.48,5.48,0,0,0-.23,1.64V169Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M227.63,164.85a4.28,4.28,0,0,1,1.28-3.41,3.86,3.86,0,0,1,2.61-.92,3.72,3.72,0,0,1,2.8,1.12,4.27,4.27,0,0,1,1.09,3.1,5.49,5.49,0,0,1-.48,2.52,3.4,3.4,0,0,1-1.4,1.43,4.07,4.07,0,0,1-2,.51,3.73,3.73,0,0,1-2.82-1.12A4.46,4.46,0,0,1,227.63,164.85Zm1.45,0a3.53,3.53,0,0,0,.7,2.39,2.32,2.32,0,0,0,3.49,0,3.62,3.62,0,0,0,.7-2.43,3.43,3.43,0,0,0-.7-2.33,2.32,2.32,0,0,0-3.49,0A3.52,3.52,0,0,0,229.08,164.85Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M237.05,169v-8.3h1.26v1.16a3,3,0,0,1,1-1,2.92,2.92,0,0,1,1.48-.37,2.73,2.73,0,0,1,1.51.38,2.05,2.05,0,0,1,.83,1.07,3,3,0,0,1,2.56-1.45,2.53,2.53,0,0,1,1.9.68,2.92,2.92,0,0,1,.66,2.11V169h-1.4v-5.23a3.86,3.86,0,0,0-.14-1.21,1.18,1.18,0,0,0-.5-.6,1.55,1.55,0,0,0-.84-.23,2,2,0,0,0-1.45.58,2.56,2.56,0,0,0-.58,1.86V169H242v-5.39a2.37,2.37,0,0,0-.34-1.41,1.3,1.3,0,0,0-1.12-.47,2,2,0,0,0-1.1.31,1.77,1.77,0,0,0-.73.91,5.14,5.14,0,0,0-.23,1.73V169Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M257.9,167.74l.2,1.24a5.24,5.24,0,0,1-1.06.13,2.41,2.41,0,0,1-1.19-.24,1.35,1.35,0,0,1-.59-.64,5,5,0,0,1-.17-1.66V161.8h-1V160.7h1v-2.05l1.4-.84v2.9h1.41v1.09h-1.41v4.85a2.44,2.44,0,0,0,.07.77.58.58,0,0,0,.24.27.94.94,0,0,0,.48.1A4.54,4.54,0,0,0,257.9,167.74Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M259.27,169V157.55h1.41v4.11a3.14,3.14,0,0,1,2.48-1.14,3.35,3.35,0,0,1,1.6.36,2.13,2.13,0,0,1,1,1,4.63,4.63,0,0,1,.29,1.86V169h-1.41v-5.26a2.17,2.17,0,0,0-.46-1.54,1.7,1.7,0,0,0-1.29-.48,2.28,2.28,0,0,0-1.18.32,1.83,1.83,0,0,0-.79.88,4,4,0,0,0-.23,1.53V169Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M273.85,166.33l1.45.18a3.54,3.54,0,0,1-1.27,2,4.31,4.31,0,0,1-5.26-.42,4.38,4.38,0,0,1-1.07-3.14,4.59,4.59,0,0,1,1.08-3.25,3.65,3.65,0,0,1,2.8-1.16,3.55,3.55,0,0,1,2.72,1.13,4.5,4.5,0,0,1,1.05,3.19c0,.08,0,.21,0,.38h-6.19a3.18,3.18,0,0,0,.77,2.09,2.3,2.3,0,0,0,1.73.73,2.15,2.15,0,0,0,1.32-.41A2.7,2.7,0,0,0,273.85,166.33Zm-4.62-2.27h4.63a2.81,2.81,0,0,0-.53-1.57,2.16,2.16,0,0,0-1.74-.81,2.24,2.24,0,0,0-1.63.65A2.57,2.57,0,0,0,269.23,164.05Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M281,166.52l1.39-.22a1.94,1.94,0,0,0,.65,1.28,2.27,2.27,0,0,0,1.5.45,2.2,2.2,0,0,0,1.44-.39,1.18,1.18,0,0,0,.47-.93A.85.85,0,0,0,286,166a6.1,6.1,0,0,0-1.44-.48,13.07,13.07,0,0,1-2.14-.68,2,2,0,0,1-1.21-1.9,2.14,2.14,0,0,1,.25-1,2.27,2.27,0,0,1,.69-.79,2.91,2.91,0,0,1,.89-.41,4.26,4.26,0,0,1,1.21-.17,4.8,4.8,0,0,1,1.71.28,2.33,2.33,0,0,1,1.09.76,3,3,0,0,1,.48,1.29l-1.37.19a1.5,1.5,0,0,0-.54-1,2,2,0,0,0-1.27-.36A2.3,2.3,0,0,0,283,162a.93.93,0,0,0-.41.75.78.78,0,0,0,.17.49,1.23,1.23,0,0,0,.54.38q.21.08,1.24.36a17.35,17.35,0,0,1,2.08.65,2.11,2.11,0,0,1,.93.74,2.06,2.06,0,0,1,.34,1.2,2.36,2.36,0,0,1-.41,1.32,2.65,2.65,0,0,1-1.18,1,4.31,4.31,0,0,1-1.75.34,3.9,3.9,0,0,1-2.46-.67A3.12,3.12,0,0,1,281,166.52Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path d="M289.52,159.16v-1.62h1.41v1.62Zm0,9.84v-8.3h1.41V169Z" transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M298.45,169v-1a2.58,2.58,0,0,1-2.32,1.23,3.26,3.26,0,0,1-1.82-.55,3.59,3.59,0,0,1-1.29-1.53,5.28,5.28,0,0,1-.46-2.25,5.89,5.89,0,0,1,.41-2.25,3.27,3.27,0,0,1,1.24-1.55,3.32,3.32,0,0,1,1.85-.54,2.77,2.77,0,0,1,1.34.32,2.8,2.8,0,0,1,1,.82v-4.11h1.4V169ZM294,164.86a3.6,3.6,0,0,0,.67,2.38,2,2,0,0,0,1.59.79,2,2,0,0,0,1.57-.75,3.48,3.48,0,0,0,.64-2.3,3.9,3.9,0,0,0-.66-2.5,2,2,0,0,0-1.62-.8,2,2,0,0,0-1.57.77A3.78,3.78,0,0,0,294,164.86Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M307.65,166.33l1.45.18a3.54,3.54,0,0,1-1.27,2,4.31,4.31,0,0,1-5.26-.42,4.38,4.38,0,0,1-1.07-3.14,4.59,4.59,0,0,1,1.08-3.25,3.65,3.65,0,0,1,2.8-1.16,3.55,3.55,0,0,1,2.72,1.13,4.5,4.5,0,0,1,1.05,3.19c0,.08,0,.21,0,.38H303a3.18,3.18,0,0,0,.77,2.09,2.3,2.3,0,0,0,1.73.73,2.15,2.15,0,0,0,1.32-.41A2.7,2.7,0,0,0,307.65,166.33ZM303,164.05h4.63a2.81,2.81,0,0,0-.53-1.57,2.16,2.16,0,0,0-1.74-.81,2.24,2.24,0,0,0-1.63.65A2.57,2.57,0,0,0,303,164.05Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M312.16,169h-1.3V157.55h1.41v4.09a2.78,2.78,0,0,1,2.27-1.12,3.48,3.48,0,0,1,1.45.31,3,3,0,0,1,1.13.87,4.21,4.21,0,0,1,.69,1.35,5.55,5.55,0,0,1,.25,1.69A4.74,4.74,0,0,1,317,168a3.3,3.3,0,0,1-2.53,1.16,2.64,2.64,0,0,1-2.3-1.23Zm0-4.21a4.31,4.31,0,0,0,.41,2.16,2,2,0,0,0,3.39.29,3.64,3.64,0,0,0,.67-2.39,3.7,3.7,0,0,0-.64-2.4,2,2,0,0,0-1.56-.77,2,2,0,0,0-1.59.8A3.51,3.51,0,0,0,312.15,164.79Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M325.18,168a5.23,5.23,0,0,1-1.5.94,4.35,4.35,0,0,1-1.55.27,3,3,0,0,1-2.1-.67,2.21,2.21,0,0,1-.73-1.71,2.31,2.31,0,0,1,1-1.92,3.43,3.43,0,0,1,1-.46,10.11,10.11,0,0,1,1.25-.21,12.83,12.83,0,0,0,2.51-.48c0-.19,0-.31,0-.37a1.55,1.55,0,0,0-.4-1.21,2.36,2.36,0,0,0-1.6-.48,2.49,2.49,0,0,0-1.46.35,2.13,2.13,0,0,0-.7,1.23l-1.37-.19a3.41,3.41,0,0,1,.62-1.43,2.7,2.7,0,0,1,1.24-.84,5.54,5.54,0,0,1,1.88-.29,5,5,0,0,1,1.73.25,2.28,2.28,0,0,1,1,.63,2.21,2.21,0,0,1,.44,1,7.92,7.92,0,0,1,.07,1.3v1.88a20,20,0,0,0,.09,2.48,3.12,3.12,0,0,0,.36,1h-1.47A3,3,0,0,1,325.18,168Zm-.12-3.14a10.3,10.3,0,0,1-2.3.53,5.33,5.33,0,0,0-1.23.28,1.23,1.23,0,0,0-.55.46,1.24,1.24,0,0,0,.23,1.61,1.83,1.83,0,0,0,1.25.38,2.9,2.9,0,0,0,1.45-.36,2.19,2.19,0,0,0,.93-1,3.39,3.39,0,0,0,.23-1.41Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M328.65,169v-8.3h1.27V162a3.44,3.44,0,0,1,.89-1.16,1.56,1.56,0,0,1,.9-.28,2.75,2.75,0,0,1,1.45.45l-.48,1.3a2,2,0,0,0-1-.3,1.34,1.34,0,0,0-.83.28,1.5,1.5,0,0,0-.52.77,5.48,5.48,0,0,0-.23,1.64V169Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M200.55,186.94l.2,1.24a5.24,5.24,0,0,1-1.06.13,2.41,2.41,0,0,1-1.19-.24,1.35,1.35,0,0,1-.59-.64,5,5,0,0,1-.17-1.66V181h-1V179.9h1v-2.05l1.4-.84v2.9h1.41V181h-1.41v4.85a2.44,2.44,0,0,0,.07.77.58.58,0,0,0,.24.27.93.93,0,0,0,.48.1A4.55,4.55,0,0,0,200.55,186.94Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M201.4,184.05a4.28,4.28,0,0,1,1.28-3.41,3.86,3.86,0,0,1,2.61-.92,3.72,3.72,0,0,1,2.8,1.12,4.27,4.27,0,0,1,1.09,3.1,5.49,5.49,0,0,1-.48,2.52,3.4,3.4,0,0,1-1.4,1.43,4.07,4.07,0,0,1-2,.51,3.73,3.73,0,0,1-2.82-1.12A4.46,4.46,0,0,1,201.4,184.05Zm1.45,0a3.53,3.53,0,0,0,.7,2.39,2.32,2.32,0,0,0,3.49,0,3.62,3.62,0,0,0,.7-2.43,3.43,3.43,0,0,0-.7-2.33,2.32,2.32,0,0,0-3.49,0A3.52,3.52,0,0,0,202.84,184.05Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M218.34,186.94l.2,1.24a5.24,5.24,0,0,1-1.06.13,2.41,2.41,0,0,1-1.19-.24,1.35,1.35,0,0,1-.59-.64,5,5,0,0,1-.17-1.66V181h-1V179.9h1v-2.05l1.4-.84v2.9h1.41V181h-1.41v4.85a2.44,2.44,0,0,0,.07.77.58.58,0,0,0,.24.27.93.93,0,0,0,.48.1A4.55,4.55,0,0,0,218.34,186.94Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M219.71,188.2V176.75h1.41v4.11a3.14,3.14,0,0,1,2.48-1.14,3.35,3.35,0,0,1,1.6.36,2.13,2.13,0,0,1,1,1,4.63,4.63,0,0,1,.29,1.86v5.26h-1.41v-5.26a2.17,2.17,0,0,0-.46-1.54,1.7,1.7,0,0,0-1.29-.48,2.28,2.28,0,0,0-1.18.32,1.83,1.83,0,0,0-.79.88,4,4,0,0,0-.23,1.53v4.54Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path d="M228.62,178.36v-1.62H230v1.62Zm0,9.84v-8.3H230v8.3Z" transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M231.6,185.72l1.39-.22a1.94,1.94,0,0,0,.65,1.28,2.27,2.27,0,0,0,1.5.45,2.2,2.2,0,0,0,1.44-.39,1.18,1.18,0,0,0,.47-.93.86.86,0,0,0-.41-.75,6.11,6.11,0,0,0-1.44-.48,13.07,13.07,0,0,1-2.14-.68,2,2,0,0,1-1.21-1.9,2.14,2.14,0,0,1,.25-1,2.27,2.27,0,0,1,.69-.79,2.91,2.91,0,0,1,.89-.41,4.26,4.26,0,0,1,1.21-.17,4.8,4.8,0,0,1,1.71.28,2.33,2.33,0,0,1,1.09.76,3,3,0,0,1,.48,1.29l-1.37.19a1.51,1.51,0,0,0-.54-1,2,2,0,0,0-1.27-.36,2.3,2.3,0,0,0-1.38.32.93.93,0,0,0-.41.75.77.77,0,0,0,.17.49,1.23,1.23,0,0,0,.54.38q.21.08,1.24.36a17.38,17.38,0,0,1,2.08.65,2.12,2.12,0,0,1,.93.74,2.06,2.06,0,0,1,.34,1.2,2.36,2.36,0,0,1-.41,1.32,2.65,2.65,0,0,1-1.18,1,4.31,4.31,0,0,1-1.75.34,3.9,3.9,0,0,1-2.46-.67A3.12,3.12,0,0,1,231.6,185.72Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M250,187.18a5.24,5.24,0,0,1-1.5.94,4.35,4.35,0,0,1-1.55.27,3,3,0,0,1-2.1-.67,2.2,2.2,0,0,1-.73-1.71,2.31,2.31,0,0,1,1-1.92,3.42,3.42,0,0,1,1-.46,10.09,10.09,0,0,1,1.25-.21,12.85,12.85,0,0,0,2.51-.48c0-.19,0-.31,0-.37a1.55,1.55,0,0,0-.4-1.21,2.36,2.36,0,0,0-1.6-.48,2.49,2.49,0,0,0-1.46.35,2.12,2.12,0,0,0-.7,1.23l-1.37-.19a3.41,3.41,0,0,1,.62-1.43,2.7,2.7,0,0,1,1.24-.84,5.54,5.54,0,0,1,1.88-.29,5,5,0,0,1,1.73.25,2.28,2.28,0,0,1,1,.63,2.23,2.23,0,0,1,.44,1,7.92,7.92,0,0,1,.07,1.3v1.88a19.76,19.76,0,0,0,.09,2.48,3.12,3.12,0,0,0,.36,1H250.3A3,3,0,0,1,250,187.18Zm-.12-3.14a10.3,10.3,0,0,1-2.3.53,5.33,5.33,0,0,0-1.23.28,1.22,1.22,0,0,0-.55.46,1.24,1.24,0,0,0,.23,1.61,1.83,1.83,0,0,0,1.25.38,2.9,2.9,0,0,0,1.45-.36,2.19,2.19,0,0,0,.93-1,3.4,3.4,0,0,0,.23-1.41Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M253.49,188.2v-8.3h1.27v1.26a3.44,3.44,0,0,1,.89-1.16,1.56,1.56,0,0,1,.9-.28,2.75,2.75,0,0,1,1.45.45l-.48,1.3a2,2,0,0,0-1-.3,1.34,1.34,0,0,0-.83.28,1.5,1.5,0,0,0-.52.77,5.48,5.48,0,0,0-.23,1.64v4.34Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M264.52,185.53l1.45.18a3.54,3.54,0,0,1-1.27,2,4.31,4.31,0,0,1-5.26-.42,4.38,4.38,0,0,1-1.07-3.14,4.59,4.59,0,0,1,1.08-3.25,3.65,3.65,0,0,1,2.8-1.16,3.55,3.55,0,0,1,2.72,1.13A4.5,4.5,0,0,1,266,184c0,.08,0,.21,0,.38h-6.19a3.18,3.18,0,0,0,.77,2.09,2.3,2.3,0,0,0,1.73.73,2.15,2.15,0,0,0,1.32-.41A2.7,2.7,0,0,0,264.52,185.53Zm-4.62-2.27h4.63a2.81,2.81,0,0,0-.53-1.57,2.16,2.16,0,0,0-1.74-.81,2.24,2.24,0,0,0-1.63.65A2.57,2.57,0,0,0,259.9,183.25Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
                <path
                    d="M273.15,187.18a5.23,5.23,0,0,1-1.5.94,4.35,4.35,0,0,1-1.55.27,3,3,0,0,1-2.1-.67,2.21,2.21,0,0,1-.73-1.71,2.31,2.31,0,0,1,1-1.92,3.43,3.43,0,0,1,1-.46,10.11,10.11,0,0,1,1.25-.21,12.83,12.83,0,0,0,2.51-.48c0-.19,0-.31,0-.37a1.55,1.55,0,0,0-.4-1.21,2.36,2.36,0,0,0-1.6-.48,2.49,2.49,0,0,0-1.46.35,2.13,2.13,0,0,0-.7,1.23l-1.37-.19a3.41,3.41,0,0,1,.62-1.43,2.7,2.7,0,0,1,1.24-.84,5.54,5.54,0,0,1,1.88-.29A5,5,0,0,1,273,180a2.28,2.28,0,0,1,1,.63,2.21,2.21,0,0,1,.44,1,7.92,7.92,0,0,1,.07,1.3v1.88a20,20,0,0,0,.09,2.48,3.12,3.12,0,0,0,.36,1h-1.47A3,3,0,0,1,273.15,187.18ZM273,184a10.3,10.3,0,0,1-2.3.53,5.33,5.33,0,0,0-1.23.28,1.23,1.23,0,0,0-.55.46,1.24,1.24,0,0,0,.23,1.61,1.83,1.83,0,0,0,1.25.38,2.9,2.9,0,0,0,1.45-.36,2.19,2.19,0,0,0,.93-1,3.39,3.39,0,0,0,.23-1.41Z"
                    transform="translate(-27.44 -58)" style="fill:#7a7a7a"/>
            </g>
        </svg>
        <svg (dblclick)="openInspector($event)" #canvas class="cwl-workflow" tabindex="-1"
             [ct-drop-enabled]="true"
             [ct-drop-zones]="['zone1']"
             (onDropSuccess)="onDrop($event.detail.data.event, $event.detail.data.transfer_data)"></svg>
            
        <span class="svg-btns">
            <span class="btn-group">
                <button class="btn btn-sm btn-secondary"
                        (click)="upscale()"
                        [disabled]="graph !== undefined && graph.getScale() >= 2">
                    <i class="fa fa-plus"></i>
                </button>
                <button class="btn btn-sm btn-secondary"
                        (click)="downscale()"
                        [disabled]="graph !== undefined && graph.getScale() <= 0.2">
                    <i class="fa fa-minus"></i>
                </button>
                <button class="btn btn-sm btn-secondary"
                        (click)="fitToViewport()">
                    <i class="fa fa-compress"></i>
                </button>
            </span>
            <span class="btn-group">
                <button class="btn btn-sm btn-secondary"
                        (click)="arrange()">
                    <i class="fa fa-share-alt"></i>
                </button>
            </span>
            <span class="btn-group">
                <button *ngIf="selectedElement"
                        class="btn btn-sm btn-secondary"
                        (click)="deleteSelectedElement()">
                    <i class="fa fa-scissors"></i>
                </button>
            </span>
        </span>

        <!--Inspector Template --> 
        <ng-template #inspector>
            <ct-editor-inspector-content>
                <div class="tc-header">
                    {{ inspectedNode.label || inspectedNode.id || inspectedNode.loc || typeOfInspectedNode()}}
                </div>
                <div class="tc-body">
                    <ct-workflow-step-inspector *ngIf="typeOfInspectedNode() === 'Step'"
                                                [step]="inspectedNode"
                                                [graph]="graph"
                                                [workflowModel]="model">
                    </ct-workflow-step-inspector>

                    <ct-workflow-io-inspector
                        *ngIf="typeOfInspectedNode() === 'Input' || typeOfInspectedNode() === 'Output'"
                        [port]="inspectedNode"
                        [graph]="graph"
                        [workflowModel]="model">

                    </ct-workflow-io-inspector>

                </div>
            </ct-editor-inspector-content>
        </ng-template>
    `
})
export class WorkflowGraphEditorComponent extends DirectiveBase implements OnChanges, OnDestroy, AfterViewInit {

    @Input()
    public model: WorkflowModel;

    modelEventListeners = [];

    modelChangedFromHistory: WorkflowModel;

    @Input()
    public readonly = false;

    @Output()
    public modelChange = new EventEmitter();

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("controls")
    private controlsTemplate: TemplateRef<any>;

    @ViewChild("inspector", {read: TemplateRef})
    private inspectorTemplate: TemplateRef<any>;

    inspectedNode: StepModel | WorkflowOutputParameterModel | WorkflowInputParameterModel = null;

    public graph: Workflow;

    public selectedElement: SVGElement;

    private historyHandler: (ev: KeyboardEvent) => void;

    /**
     * If we're trying to trigger operations on graph that require viewport calculations (like fitting to viewport)
     * it might break because the viewport might not be available. This can happen if n tabs are being opened at the same time
     * so n-1 tabs are rendering without their SVG containers having bounding boxes.
     * So, we will schedule the fitting to be done when user opens the tab next time.
     */
    private tryToFitWorkflowOnNextTabActivation = false;

    private emptyState = false;

    constructor(private gateway: DataGatewayService,
                private ipc: IpcService,
                private inspector: EditorInspectorService,
                private workflowEditorService: WorkflowEditorService) {
        super();
    }

    private canvasIsInFocus() {
        const el = this.canvas.nativeElement;
        return el.getClientRects().length > 0 && (document.activeElement === el || el.contains(document.activeElement));
    }

    ngAfterViewInit() {

        if (Workflow.canDrawIn(this.canvas.nativeElement)) {
            this.drawGraphAndAttachListeners();
        } else {
            this.tryToFitWorkflowOnNextTabActivation = true;
        }
    }

    drawGraphAndAttachListeners() {

        this.graph = new Workflow(this.canvas.nativeElement, this.model as any);

        try {
            this.graph.fitToViewport();
        } catch (ex) {
            setTimeout(() => {
                console.warn("Workflow should be able to fit in by now...");
                try {
                    this.graph.fitToViewport();
                } catch (ex) {
                    console.warn("Screw fitting.");
                }
            }, 1);
        }

        this.graph.on("beforeChange", () => {
            this.workflowEditorService.putInHistory(this.model);
        });

        this.graph.on("selectionChange", (ev) => {
            this.selectedElement = ev;
        });

        this.tracked = this.ipc.watch("accelerator", "CmdOrCtrl+Z")
            .filter(() => this.canvasIsInFocus() && this.workflowEditorService.canUndo())
            .subscribe(() => {

                this.modelChangedFromHistory = WorkflowFactory.from(this.workflowEditorService.historyUndo(this.model));

                // Resets the reference of inspected node (reference is lost after model serialization)
                this.resetInspectedNodeReference();

                this.modelChange.next(this.modelChangedFromHistory);
            });

        this.tracked = this.ipc.watch("accelerator", "Shift+CmdOrCtrl+Z")
            .filter(() => this.canvasIsInFocus() && this.workflowEditorService.canRedo())
            .subscribe(() => {

                this.modelChangedFromHistory =  WorkflowFactory.from(this.workflowEditorService.historyRedo(this.model));

                // Resets the reference of inspected node (reference is lost after model serialization)
                this.resetInspectedNodeReference();

                this.modelChange.next(this.modelChangedFromHistory);
            });
    }

    /**
     * If inspector is open, set reference of inspected node to a new one
     */
    resetInspectedNodeReference() {
        if (this.inspectedNode) {
            const connectionId = this.inspectedNode.connectionId;

            const step         = this.model.steps.find((step) => connectionId === step.connectionId);
            const input        = this.model.inputs.find((input) => connectionId === input.connectionId);
            const output       = this.model.outputs.find((output) => connectionId === output.connectionId);
            this.inspectedNode = step || input || output;

            // When you create some node (i/o or step by dropping it on a canvas) and open it in object inspector, when
            // you go backward in history (undo) object inspector should be closed
            if (!this.inspectedNode) this.inspector.hide();
        }
    }

    /**
     * Register event listeners on a current model
     */
    registerModelEventListeners() {
        // Close object inspector if step/input/output is removed
        const removeHandler = (node) => {
            if (this.inspectedNode && this.inspectedNode.id === node.id) {
                this.inspector.hide();
                this.inspectedNode = null;
            }
        };

        this.modelEventListeners = [
            this.model.on("output.remove", removeHandler),
            this.model.on("input.remove", removeHandler),
            this.model.on("step.remove", removeHandler)
        ];
    }

    ngOnChanges(changes: SimpleChanges) {

        // When model is changed we have to know whether change is external (change revision/copy app...)
        // or internal (undo/redo from history)
        if (this.model !== changes["model"].previousValue && this.model !== this.modelChangedFromHistory) {

            this.workflowEditorService.emptyHistory();
            this.registerModelEventListeners();
            this.resetInspectedNodeReference();
        }

        if (this.graph && this.canvas && Workflow.canDrawIn(this.canvas.nativeElement)) {
            this.graph.redraw(this.model as any);
        }
        // if (firstAnything && firstAnything.customProps["sbg:x"] === undefined) {
        //     console.log("Should arrange");
        //     // this.graph.command("workflow.arrange");
        // }


        // this.statusBar.setControls(this.controlsTemplate);
    }

    upscale() {
        if (this.graph.getScale() <= Workflow.maxScale) {
            const newScale = this.graph.getScale() + .1;
            this.graph.scaleWorkflowCenter(newScale > Workflow.maxScale ?
                Workflow.maxScale : newScale);
        }
    }

    downscale() {
        if (this.graph.getScale() >= Workflow.minScale) {
            const newScale = this.graph.getScale() - .1;
            this.graph.scaleWorkflowCenter(newScale < Workflow.minScale ?
                Workflow.minScale : newScale);
        }
    }

    fitToViewport() {
        this.graph.fitToViewport();
    }

    arrange() {
        this.graph.arrange();
    }

    deleteSelectedElement() {
        this.graph.deleteSelection();
        this.selectedElement = null;
    }


    /**
     * Triggers when app is dropped on canvas
     */
    onDrop(ev: MouseEvent, nodeID: string) {
        console.log("Dropped!", nodeID);

        this.gateway.fetchFileContent(nodeID, true).subscribe((app: any) => {
            // if the app is local, give it an id that's the same as its filename (if doesn't exist)
            const isLocal = DataGatewayService.getFileSource(nodeID) === "local";
            if (isLocal) {
                const split = nodeID.split("/");
                const id    = split[split.length - 1].split(".")[0];
                app.id      = app.id || id;
            }

            const step = this.model.addStepFromProcess(app);

            // add local source so step can be serialized without embedding
            if (isLocal) {
                step.customProps["sbg:rdfSource"] = nodeID;
                step.customProps["sbg:rdfId"]     = nodeID;
            }

            const coords = this.graph.transformScreenCTMtoCanvas(ev.clientX, ev.clientY);
            Object.assign(step.customProps, {
                "sbg:x": coords.x,
                "sbg:y": coords.y
            });

            this.graph.command("app.create.step", step);
        }, err => {
            console.warn("Could not add an app", err);
        });
    }

    /**
     * Triggers when click events occurs on canvas
     */
    openInspector(ev: Event) {
        let current = ev.target as Element;

        // Check if clicked element is a node or any descendant of a node (in order to open object inspector if so)
        while (current !== this.canvas.nativeElement) {
            if (this.hasClassSvgElement(current, "node")) {
                this.openNodeInInspector(current);
                break;
            }
            current = current.parentNode as Element;
        }
    }

    /**
     * Returns type of inspected node to determine which template to render for object inspector
     */
    typeOfInspectedNode() {
        if (this.inspectedNode instanceof StepModel) {
            return "Step";
        } else if (this.inspectedNode instanceof WorkflowInputParameterModel) {
            return "Input";
        } else {
            return "Output";
        }
    }

    /**
     * Open node in object inspector
     */
    private openNodeInInspector(node: Element) {

        let typeOfNode = "steps";

        if (this.hasClassSvgElement(node, "input")) {
            typeOfNode = "inputs";
        } else if (this.hasClassSvgElement(node, "output")) {
            typeOfNode = "outputs";
        }

        this.inspectedNode = this.model[typeOfNode].find((input) => input.id === node.getAttribute("data-id"));
        this.inspector.show(this.inspectorTemplate, this.inspectedNode.id);
    }

    /**
     * IE does not support classList property for old browsers and also SVG elements
     */
    private hasClassSvgElement(element: Element, className: string) {
        const elementClass = element.getAttribute("class") || "";
        return elementClass.split(" ").indexOf(className) > -1;
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        // Dispose model event listeners (remove step/input/output ...)
        this.modelEventListeners.forEach((item) => {
            item.dispose();
        });

        // When you click on remove tab (X) on non active tab which has no graph rendered yet
        if (this.graph) {
            this.graph.destroy();
        }

        this.workflowEditorService.emptyHistory();
        window.removeEventListener("keypress", this.historyHandler);
        this.inspector.hide();
    }

    checkOutstandingGraphFitting() {
        if (this.tryToFitWorkflowOnNextTabActivation === false) {
            return;
        }
        this.drawGraphAndAttachListeners();
        this.tryToFitWorkflowOnNextTabActivation = false;
    }
}
