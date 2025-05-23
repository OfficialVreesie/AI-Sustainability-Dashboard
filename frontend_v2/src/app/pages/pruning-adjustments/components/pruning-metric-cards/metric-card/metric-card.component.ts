import {Component, Input} from '@angular/core';
import {PruningMetricCard} from '@app/types/pruning.types';
import {MetricColor, MetricColorScheme} from '@app/types/metric.types';
import {ThresholdService} from '@app/services/threshold.service';
import {map, Observable, tap} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-metric-card',
  imports: [
    AsyncPipe
  ],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss'
})
export class MetricCardComponent {

  @Input() metric: PruningMetricCard

  public value$: Observable<number> = this.thresholdService.threshold.asObservable().pipe(
    map((threshold) => this.metric.values[threshold] ?? 0),
  )

  private colorScheme: MetricColorScheme = {
    power: {
      header: '#6B21A8',
      value: '#9333EA',
      background: 'rgba(115,0,255,0.2)'
    },
    performance: {
      header: '#166534',
      value: '#16A34A',
      background: 'rgba(0,255,13,0.2)'
    },
    carbon: {
      header: '#9A3412',
      value: '#EA580C',
      background: 'rgba(255,102,0,0.2)'
    },
    compute: {
      header: '#991B1B',
      value: '#DC2626',
      background: 'rgba(255,0,0,0.2)'
    }
  }

  constructor(
    private readonly thresholdService: ThresholdService
  ) {
  }

  get color(): MetricColor {
    return this.colorScheme[this.metric.type];
  }
}
