import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabLoaderComponent } from './tab-loader.component';

describe('TabLoaderComponent', () => {
  let component: TabLoaderComponent;
  let fixture: ComponentFixture<TabLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
