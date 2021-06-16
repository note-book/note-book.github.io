import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styles: []
})
export class SigninComponent implements OnInit {
  signinForm!: FormGroup;
  errorMsgOnSubmit: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.signinForm = new FormGroup({
      email: new FormControl (null, [Validators.required, Validators.email]),
      password: new FormControl (null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
    });
  }

  onSubmit(signinForm: FormGroup){
    this.isLoading = true;
    const email = signinForm.value.email;
    const password =  signinForm.value.password;
    this.authService.signIn(email, password).subscribe(() => {      
      this.errorMsgOnSubmit = '';
      this.router.navigate(['/companies']);
      this.isLoading = false;
    }, error => {      
      this.errorMsgOnSubmit = error; 
      this.isLoading = false;
    });
  }
}
