import {Component, Input, OnInit} from '@angular/core';
import {ReplaySubject} from "rxjs";

@Component({
    selector: 'view-switcher',
    template: `
<button (click)="toggleView()" class="btn btn-sm" [disabled]="disabled">
    <i class="fa" [ngClass]="classes"></i>    
    {{ mode }}
</button>
`
})
export class ViewSwitcherComponent implements OnInit{
    @Input()
    disabled: boolean;

    @Input()
    viewMode: ReplaySubject<'gui' | 'json'>;
    private classes = {'fa-toggle-on': false, 'fa-toggle-off': true};
    private mode: 'gui' | 'json';

    toggleView() {
        this.viewMode.next(this.mode === 'gui' ? 'json' : 'gui');
    }

    ngOnInit(): void {
        this.viewMode.subscribe(mode => {
            this.mode = mode;
            this.classes = {
                'fa-toggle-on': mode === 'gui',
                'fa-toggle-off': mode === 'json'
            };

        })
    }
}