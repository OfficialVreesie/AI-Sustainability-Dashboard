import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruningTopBarComponent } from './pruning-top-bar.component';

describe('PruningTopBarComponent', () => {
  let component: PruningTopBarComponent;
  let fixture: ComponentFixture<PruningTopBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruningTopBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruningTopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
