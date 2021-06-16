import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'

import { SigninComponent } from './signin.component';
import { AuthGuardOut } from '../shared/services/authOut.guard.service';

@NgModule({
  declarations:[
    SigninComponent
  ],
  imports:[
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {path: '', component: SigninComponent, canActivate: [AuthGuardOut]}
    ])
  ]
})
export class SigninModule{}