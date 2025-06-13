import {FormControl, FormGroup} from '@angular/forms';

interface PruneSettingsFormControls {
  gpu: FormControl<string | null>;
  location: FormControl<string | null>;
  metric: FormControl<string | null>;
  threshold: FormControl<number | null>;
}

export type PruneSettingsFormGroup = FormGroup<PruneSettingsFormControls>;

export type PruningMetricCardList = {
  [key in 'power' | 'performance' | 'emissions' | 'compute']: PruningMetricCard;
};

export interface PruningMetricCard {
  title: string;
  unit: string;
  values: Record<number, number>
}

export interface PruningClassPerformance {
  className: string;
  unit: string | null;
  original: number;
  pruned: {
    [threshold: number]: number;
  }
}

export type PruningTab = 'Charts' | 'Performance per Class';


export interface PruningSettings {
  gpus: string[];
  locations: string[];
  metrics: string[];
}

export interface PruningPlaygroundData {
  tflops: Record<number, number>;
  power: Record<number, number>;
  emissions: Record<number, number>;
  performance: Record<number, number>;
}
