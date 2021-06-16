import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ManageCompaniesComponent } from './manage-companies.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuardIn } from '../shared/services/authIn.guard.service';

@NgModule({
  declarations: [
    ManageCompaniesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {path: '', component: ManageCompaniesComponent, canActivate: [AuthGuardIn]}
    ])
  ]
})
export class ManageCompaniesModule { }
