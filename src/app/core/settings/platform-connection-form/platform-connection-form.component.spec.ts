import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformConnectionFormComponent } from './platform-connection-form.component';

describe('PlatformConnectionFormComponent', () => {
  let component: PlatformConnectionFormComponent;
  let fixture: ComponentFixture<PlatformConnectionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlatformConnectionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatformConnectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
