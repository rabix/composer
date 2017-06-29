import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformCredentialsModalComponent } from './platform-credentials-modal.component';

describe('PlatformCredentialsModalComponent', () => {
  let component: PlatformCredentialsModalComponent;
  let fixture: ComponentFixture<PlatformCredentialsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlatformCredentialsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatformCredentialsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
