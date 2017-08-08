import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";

@Component({
  selector: 'ct-input-field',
  template: `
    <p>
      input-field Works!
    </p>
  `,
  styleUrls: ['./input-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputFieldComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
