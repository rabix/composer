import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowJobEditorComponent } from './workflow-job-editor.component';

describe('WorkflowJobEditorComponent', () => {
  let component: WorkflowJobEditorComponent;
  let fixture: ComponentFixture<WorkflowJobEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowJobEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowJobEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
