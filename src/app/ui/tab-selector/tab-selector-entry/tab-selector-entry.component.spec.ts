import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabSelectorEntryComponent } from './tab-selector-entry.component';

describe('TabSelectorEntryComponent', () => {
  let component: TabSelectorEntryComponent;
  let fixture: ComponentFixture<TabSelectorEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabSelectorEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSelectorEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
