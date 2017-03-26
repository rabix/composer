import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NavSearchResultComponent } from "./nav-search-result.component";

describe("NavSearchResultComponent", () => {
  let component: NavSearchResultComponent;
  let fixture: ComponentFixture<NavSearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavSearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
