import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseCommandListComponent } from './base-command-list.component';

describe('BaseCommandListComponent', () => {
  let component: BaseCommandListComponent;
  let fixture: ComponentFixture<BaseCommandListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseCommandListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseCommandListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
