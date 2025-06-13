import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {

  public threshold = new BehaviorSubject<number>(0);

  public set Threshold(threshold: number) {
    this.threshold.next(threshold);
  }

  public get Threshold(): number {
    return this.threshold.getValue();
  }
}
