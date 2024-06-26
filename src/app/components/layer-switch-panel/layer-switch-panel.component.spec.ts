import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerSwitchPanelComponent } from './layer-switch-panel.component';

describe('LayerSwitchPanelComponent', () => {
  let component: LayerSwitchPanelComponent;
  let fixture: ComponentFixture<LayerSwitchPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerSwitchPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerSwitchPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
