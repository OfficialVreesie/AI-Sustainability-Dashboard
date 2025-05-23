import {FormControl, FormGroup} from '@angular/forms';

interface PruneSettingsFormControls {
  gpu: FormControl<string | null>;
  location: FormControl<string | null>;
  metric: FormControl<string | null>;
  threshold: FormControl<number | null>;
}

export type PruneSettingsFormGroup = FormGroup<PruneSettingsFormControls>;

export interface PruningMetricCard {
  type: 'power' | 'performance' | 'carbon' | 'compute';
  title: string;
  unit: string;
  values: {
    [threshold: number]: number;
  }
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

