import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "ct-error-report",
  template: `
    <p>
      error-report Works!
    </p>
  `,
  styleUrls: ["./error-report.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorReportComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
