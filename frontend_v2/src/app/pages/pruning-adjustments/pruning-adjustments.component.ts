import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  PruningTopBarComponent
} from '@app/pages/pruning-adjustments/components/pruning-top-bar/pruning-top-bar.component';
import {
  PruningSettingsComponent
} from '@app/pages/pruning-adjustments/components/pruning-settings/pruning-settings.component';
import {
  PruningMetricCardsComponent
} from '@app/pages/pruning-adjustments/components/pruning-metric-cards/pruning-metric-cards.component';
import {
  PruningDetailsComponent
} from '@app/pages/pruning-adjustments/components/pruning-details/pruning-details.component';
import {
  PruningChartsComponent
} from '@app/pages/pruning-adjustments/components/pruning-details/pruning-charts/pruning-charts.component';
import {
  PruningClassesComponent
} from '@app/pages/pruning-adjustments/components/pruning-details/pruning-classes/pruning-classes.component';
import {NgIf} from '@angular/common';
import {PruneSettingsFormGroup, PruningClassPerformance, PruningMetricCard, PruningTab} from '@app/types/pruning.types';
import {FormBuilder, Validators} from '@angular/forms';
import {firstValueFrom, Subscription, tap} from 'rxjs';
import {ThresholdService} from '@app/services/threshold.service';

@Component({
  selector: 'app-pruning-adjustments',
  imports: [
    PruningTopBarComponent,
    PruningSettingsComponent,
    PruningMetricCardsComponent,
    PruningDetailsComponent,
    PruningChartsComponent,
    PruningClassesComponent,
    NgIf
  ],
  templateUrl: './pruning-adjustments.component.html',
  styleUrl: './pruning-adjustments.component.scss'
})
export class PruningAdjustmentsComponent implements OnInit, OnDestroy {

  public activeTab: PruningTab = 'Charts';
  public metricCards: PruningMetricCard[] = [
    {
      type: 'power',
      title: 'Power',
      unit: 'kWh',
      values: {
        0: 0,
        0.1: 0,
      }
    },
    {
      type: 'performance',
      title: 'Accuracy',
      unit: '%',
      values: {
        0: 0,
        0.1: 0,
      }
    },
    {
      type: 'carbon',
      title: 'Carbon Footprint',
      unit: 'gCO2',
      values: {
        0: 0,
        0.1: 0,
      }
    },
    {
      type: 'compute',
      title: 'Computing Power',
      unit: '%',
      values: {
        0: 0,
        0.1: 0,
      }
    }
  ];

  public classPerformance: PruningClassPerformance[] = [
    {
      className: 'Positive',
      unit: '%',
      original: 0.70,
      pruned: {
        0: 0.70,
        0.1: 0.71,
      }
    },
    {
      className: 'Neutral',
      unit: '%',
      original: 0.72,
      pruned: {
        0: 0.72,
        0.1: 0.71
      }
    },
    {
      className: 'Negative',
      unit: '%',
      original: 0.71,
      pruned: {
        0: 0.71,
        0.1: 0.67,
      }
    }
  ]

  public settingsFormGroup: PruneSettingsFormGroup = this.formBuilder.group({
    gpu: this.formBuilder.control<string | null>(null, [Validators.required]),
    location: this.formBuilder.control<string | null>(null, [Validators.required]),
    metric: this.formBuilder.control<string | null>(null, [Validators.required]),
    threshold: this.formBuilder.control<number>(0, [Validators.required]),
  });

  private subscriptions: Subscription = new Subscription();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly thresholdService: ThresholdService,
  ) {
  }

  ngOnInit() {
    this.subscriptions.add(this.settingsFormGroup.controls.threshold.valueChanges.subscribe(threshold => {
      if (threshold === null) {
        return;
      }

      this.thresholdService.Threshold = threshold;
    }))
  }

  onTabChange(newTab: PruningTab): void {
    this.activeTab = newTab;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
