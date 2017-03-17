import {Component, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["new-file.component.scss"],
    selector: "ct-new-file-tab",
    template: `
        <div class="content-container">
        
            <!--Top empty space-->
            <div class="top-empty-space"></div>
        
            <!--Apps container-->
            <div class="apps-container">
        
                <!--New app container-->
                <div class="apps">
        
                    <!--Container title-->
                    <div class="title">
                        <h5>
                            <p><b>CREATE NEW APP</b></p>
                        </h5>
                    </div>
        
                    <!--Container context-->
                    <div class="app-container">
        
                        <!--Workflow-->
                        <div class="app">
        
                            <!--Image-->
                            <div class="image">
                                Image
                            </div>
        
                            <!--Description-->
                            <div class="description">
                                <h5>
                                    <b>Workflow</b>
                                </h5>
                                <p>
                                    Workflows are chains of interconnected tools.
                                </p>
                            </div>
                        </div>
        
                        <!--Tool-->
                        <div class="app">
        
                            <!--Image-->
                            <div class="image">
                                Image
                            </div>
        
                            <!--Description-->
                            <div class="description">
                                <h5>
                                    <b>Tool</b>
                                </h5>
                                <p>
                                    Tools are programs for processing data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
        
                <!--Recent apps container-->
                <div class="apps">
        
                    <!--Container title-->
                    <div class="title">
                        <h5>
                            <p><b>RECENT APPS</b></p>
                        </h5>
                    </div>
        
                    <!--Container context-->
                    <div class="app-container">
                        <div class="app">
                        </div>
                    </div>
                </div>
            </div>
        
            <!--Bottom empty space-->
            <div class="bottom-empty-space"></div>
        
        </div>
        
        <ct-footer-tab>
        
        </ct-footer-tab>
    `
})
export class NewFileTabComponent {

}
