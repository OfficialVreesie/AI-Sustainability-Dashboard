import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public uploadId = new BehaviorSubject<string | null>(null);
  public huggingFaceUrl = new BehaviorSubject<string | null>(null);
  public h5ModelFilename = new BehaviorSubject<string | null>(null);

  constructor() { }

  set UploadId(uploadId: string | null) {
    this.uploadId.next(uploadId);
  }

  set HuggingFaceUrl(huggingFaceUrl: string | null) {
    this.huggingFaceUrl.next(huggingFaceUrl);
  }

  set H5ModelFilename(h5ModelFilename: string | null) {
    this.h5ModelFilename.next(h5ModelFilename);
  }

  get modelName(): string | null {
    if (this.huggingFaceUrl.value) {
      // Strip the URL to get the model name
      const urlParts = this.huggingFaceUrl.value.split('/', 2);
      return urlParts[urlParts.length - 1];
    } else if (this.h5ModelFilename.value) {
      return this.h5ModelFilename.value;
    }

    return null;
  }
}
