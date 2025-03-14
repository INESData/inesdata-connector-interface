import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {JsonDialogComponent} from './json-dialog/json-dialog.component';
import {JsonDialogService} from './json-dialog/json-dialog.service';

@NgModule({
  imports: [
    // Angular
    CommonModule,
    FormsModule,

    // Angular Material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,

    // Third Party
    NgxJsonViewerModule,
  ],
  declarations: [JsonDialogComponent],
  providers: [JsonDialogService],
  exports: [JsonDialogComponent],
})
export class JsonDialogModule {}
