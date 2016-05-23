import {Component, Input} from '@angular/core';

@Component({
    selector: 'loading-spinner',
    template: `
    <div class="loading-spinner">
        <div class="icon">
            <i class="fa fa-gear fa-4x fa-spin"></i>
            <p>{{ loadingText || 'Loading...' }}</p>
        </div>
    </div>
    `,
})
export class LoadingSpinnerComponent {
    @Input() loadingText: string;
}