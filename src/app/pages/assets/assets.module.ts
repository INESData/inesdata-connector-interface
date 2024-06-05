import { NgModule } from '@angular/core';
import {AssetsRoutingModule} from "./assets-routing.module"
import { AssetViewerComponent } from './asset-viewer/asset-viewer.component';
import { AssetEditorDialog } from './asset-editor-dialog/asset-editor-dialog.component';
import { SchemaFormModule } from "ngx-schema-form";

import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { SharedModule } from 'src/app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@NgModule({
  declarations: [
    AssetViewerComponent,
    AssetEditorDialog
  ],
  imports: [
    AssetsRoutingModule,
    SharedModule,
    SchemaFormModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule,
    CKEditorModule

  ]
})
export class AssetsModule { }
