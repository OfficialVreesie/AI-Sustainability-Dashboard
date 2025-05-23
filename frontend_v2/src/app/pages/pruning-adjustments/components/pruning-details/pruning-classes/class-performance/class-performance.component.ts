import {Component, Input, OnInit} from '@angular/core';
import {PruningClassPerformance} from '@app/types/pruning.types';
import {MetricBarComponent} from '@app/domains/ui/components/metric-bar/metric-bar.component';
import {ThresholdService} from '@app/services/threshold.service';
import {map, Observable, tap} from 'rxjs';
import {AsyncPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-class-performance',
  imports: [
    MetricBarComponent,
    AsyncPipe,
  ],
  templateUrl: './class-performance.component.html',
  styleUrl: './class-performance.component.scss'
})
export class ClassPerformanceComponent {

  @Input() class: PruningClassPerformance;

  public pctChange: number = 0;
  public value$: Observable<number> = this.thresholdService.threshold.asObservable().pipe(
    map((threshold) => this.class.pruned[threshold] ?? 0),
    tap((metric) => {
      this.pctChange = (metric - this.class.original) / this.class.original * 100;
    }),
  )

  constructor(
    private readonly thresholdService: ThresholdService,
  ) {
  }
}
