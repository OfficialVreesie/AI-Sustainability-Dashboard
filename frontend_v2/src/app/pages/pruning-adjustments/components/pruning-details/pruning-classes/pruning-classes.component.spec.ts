import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruningClassesComponent } from './pruning-classes.component';

describe('PruningClassesComponent', () => {
  let component: PruningClassesComponent;
  let fixture: ComponentFixture<PruningClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruningClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruningClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
