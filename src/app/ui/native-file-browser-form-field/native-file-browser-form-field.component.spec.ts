import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {NativeFileBrowserFormFieldComponent} from "./native-file-browser-form-field.component";

describe('NativeFileBrowserFormFieldComponent', () => {
  let component: NativeFileBrowserFormFieldComponent;
  let fixture: ComponentFixture<NativeFileBrowserFormFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NativeFileBrowserFormFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NativeFileBrowserFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
