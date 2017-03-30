import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAppModalComponent } from './create-app-modal.component';

describe('CreateAppModalComponent', () => {
  let component: CreateAppModalComponent;
  let fixture: ComponentFixture<CreateAppModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAppModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAppModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
