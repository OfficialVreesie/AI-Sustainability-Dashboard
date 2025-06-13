import {Component, OnInit} from '@angular/core';
import {
  ChartComponent
} from '@app/pages/pruning-adjustments/components/pruning-details/pruning-charts/components/chart/chart.component';
import {PruningDataService} from '@app/services/pruning-data.service';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-pruning-charts',
  imports: [
    ChartComponent,
    AsyncPipe
  ],
  templateUrl: './pruning-charts.component.html',
  styleUrl: './pruning-charts.component.scss'
})
export class PruningChartsComponent {

  public powerChartData = this.pruningDataService.data$.pipe(
    map(data => data ? data.power : null)
  )

  public emissionsChartData = this.pruningDataService.data$.pipe(
    map(data => data ? data.emissions : null)
  )

  public performanceChartData = this.pruningDataService.data$.pipe(
    map(data => data ? data.performance : null)
  )

  constructor(
    private readonly pruningDataService: PruningDataService,
  ) {
  }

}
