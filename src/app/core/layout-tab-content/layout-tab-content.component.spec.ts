import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutTabContentComponent } from './layout-tab-content.component';

describe('LayoutTabContentComponent', () => {
  let component: LayoutTabContentComponent;
  let fixture: ComponentFixture<LayoutTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
