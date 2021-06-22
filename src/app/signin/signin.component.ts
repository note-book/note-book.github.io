import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {  Subscription } from 'rxjs';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styles: []
})
export class SigninComponent implements OnInit {
  errorMsgSubscription!: Subscription;
  errorMsg: string = '';
  signinForm!: FormGroup;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.signinForm = new FormGroup({
      email: new FormControl (null, [Validators.required, Validators.email]),
      password: new FormControl (null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
    });

    this.errorMsgSubscription = this.authService.errorMsgSubject.subscribe(error => {
      this.errorMsg = error;
    })
  }

  onSubmit(signinForm: FormGroup){
    const email = signinForm.value.email;
    const password =  signinForm.value.password;
    this.authService.signIn(email, password);
  }
}
