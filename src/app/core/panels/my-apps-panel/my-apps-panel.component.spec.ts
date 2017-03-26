import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MyAppsPanelComponent } from "./my-apps-panel.component";

describe("PublicAppsPanelComponent", () => {
  let component: MyAppsPanelComponent;
  let fixture: ComponentFixture<MyAppsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAppsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAppsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
