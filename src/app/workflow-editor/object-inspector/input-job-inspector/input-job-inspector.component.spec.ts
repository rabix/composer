import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputJobInspectorComponent } from './input-job-inspector.component';

describe('InputJobInspectorComponent', () => {
  let component: InputJobInspectorComponent;
  let fixture: ComponentFixture<InputJobInspectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputJobInspectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputJobInspectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
