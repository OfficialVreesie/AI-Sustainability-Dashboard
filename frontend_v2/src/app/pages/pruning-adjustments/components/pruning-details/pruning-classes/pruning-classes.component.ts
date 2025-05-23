import {Component, Input} from '@angular/core';
import {PruningClassPerformance} from '@app/types/pruning.types';
import {
  ClassPerformanceComponent
} from '@app/pages/pruning-adjustments/components/pruning-details/pruning-classes/class-performance/class-performance.component';

@Component({
  selector: 'app-pruning-classes',
  imports: [
    ClassPerformanceComponent
  ],
  templateUrl: './pruning-classes.component.html',
  styleUrl: './pruning-classes.component.scss'
})
export class PruningClassesComponent {

  @Input() classes: PruningClassPerformance[]

}
