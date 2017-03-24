import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelContainerComponent } from './panel-container.component';

describe('PanelContainerComponent', () => {
  let component: PanelContainerComponent;
  let fixture: ComponentFixture<PanelContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
