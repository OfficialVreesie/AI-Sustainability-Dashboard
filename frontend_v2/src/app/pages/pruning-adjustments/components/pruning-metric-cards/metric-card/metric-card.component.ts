import {Component, Input} from '@angular/core';
import {PruningMetricCard} from '@app/types/pruning.types';
import {MetricColor, MetricColorScheme} from '@app/types/metric.types';
import {ThresholdService} from '@app/services/threshold.service';
import {combineLatest, map, Observable, tap} from 'rxjs';
import {AsyncPipe, DecimalPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-metric-card',
  imports: [
    AsyncPipe,
    DecimalPipe,
    NgIf
  ],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss'
})
export class MetricCardComponent {

  @Input() type: 'power' | 'performance' | 'emissions' | 'compute';
  @Input() metric: PruningMetricCard;
  @Input() decimalFormat: string = '1.0-2';

  public value$: Observable<number> = this.thresholdService.threshold.asObservable().pipe(
    tap(threshold => {
      if (!(threshold in this.metric.values)) {
        console.warn(`Threshold ${threshold} not found in metric values for type ${this.type}. Defaulting to 0.`);
      }
    }),
    map((threshold) => this.metric.values[threshold] ?? 0),
  );

  // Calculate percentage change using threshold 0 as the original value
  public percentageChange$: Observable<number> = this.value$.pipe(
    map(currentValue => {
      const originalValue = this.metric.values[0] ?? 0;
      if (originalValue === 0) return 0;
      return ((currentValue - originalValue) / originalValue) * 100;
    })
  );

  // Determine if the change is positive, negative, or neutral
  public changeType$: Observable<'positive' | 'negative' | 'neutral'> = this.percentageChange$.pipe(
    map(change => {
      if (Math.abs(change) < 0.01) return 'neutral'; // Consider < 0.01% as neutral
      return change > 0 ? 'positive' : 'negative';
    })
  );

  // Get the appropriate arrow icon
  public changeIcon$: Observable<string> = this.changeType$.pipe(
    map(type => {
      switch (type) {
        case 'positive': return '↑';
        case 'negative': return '↓';
        default: return '→';
      }
    })
  );

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
    emissions: {
      header: '#9A3412',
      value: '#EA580C',
      background: 'rgba(255,102,0,0.2)'
    },
    compute: {
      header: '#991B1B',
      value: '#DC2626',
      background: 'rgba(255,0,0,0.2)'
    }
  };

  constructor(
    private readonly thresholdService: ThresholdService
  ) {
  }

  get color(): MetricColor {
    return this.colorScheme[this.type];
  }

  // Helper method to get percentage change color
  getPercentageChangeColor(changeType: 'positive' | 'negative' | 'neutral' | null): string {
    // For some metrics, positive change might be bad (e.g., power, emissions)
    // For others, positive change might be good (e.g., performance)
    const isGoodMetric = this.type === 'performance'; // performance is good when it increases

    switch (changeType) {
      case 'positive':
        return isGoodMetric ? '#16A34A' : '#DC2626'; // Green for good, red for bad
      case 'negative':
        return isGoodMetric ? '#DC2626' : '#16A34A'; // Red for good metrics going down, green for bad metrics going down
      default:
        return '#6B7280'; // Gray for neutral
    }
  }
}
