import { Routes } from '@angular/router';
import {UploadPageComponent} from './pages/upload-page/upload-page.component';
import {PruningAdjustmentsComponent} from './pages/pruning-adjustments/pruning-adjustments.component';
import {UploadLoaderComponent} from '@app/pages/loaders/upload-loader/upload-loader.component';

export const routes: Routes = [
  {
    path: 'upload',
    component: UploadPageComponent,
  },
  {
    path: 'loading-upload',
    component: UploadLoaderComponent,
  },
  {
    path: 'pruning-adjustments',
    component: PruningAdjustmentsComponent,
  },
  {
    path: 'validation-results',
    component: PruningAdjustmentsComponent,
  },
  {
    path: '**',
    redirectTo: 'upload',
  }
]
