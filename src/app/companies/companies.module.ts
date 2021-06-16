import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CompaniesComponent } from './companies.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { ReplacePipe } from '../shared/pipe/replace.pipe';
import { AuthGuardIn } from '../shared/services/authIn.guard.service';

@NgModule({
  declarations: [
    CompaniesComponent,
    ReplacePipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {path: '', component: CompaniesComponent, canActivate: [AuthGuardIn]}
    ]),
    NgxEditorModule.forRoot({
      locals: {},
    })
  ]
})
export class CompaniesModule { }
