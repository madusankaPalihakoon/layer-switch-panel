import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSublayerDialogComponent } from './add-sublayer-dialog.component';

describe('AddSublayerDialogComponent', () => {
  let component: AddSublayerDialogComponent;
  let fixture: ComponentFixture<AddSublayerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSublayerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSublayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
