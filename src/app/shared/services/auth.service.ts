import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth'

import { User } from '../models/user.model';

@Injectable({providedIn: 'root'})
export class AuthService{
  user = new BehaviorSubject<User>(null!);
  errorMsgSubject = new BehaviorSubject<string>('');
  errorMsg: string = '';

  constructor(
    private router: Router,
    private _firebaseAuth: AngularFireAuth
  ){}

  signIn(email: string, password: string){
    this._firebaseAuth.signInWithEmailAndPassword(email, password)
    .then(user => {
      this.handleAuth(user.user?.email!, user.user?.uid!, user.user?.refreshToken!)
      this.router.navigate(['/companies']);
      this.errorMsg = '';
      this.errorMsgSubject.next(this.errorMsg);
    }, error => {
      this.errorHandler(error);
    })
  }

  logout(){
    this._firebaseAuth.signOut().then(() => {
      this.user.next(null!);
      this.router.navigate(['/login']);
      localStorage.removeItem('userData');
    })
  }

  autoLogin(){ 
    const userData: {
      email: string,
      id: string,
      refreshToken: string,
    } = JSON.parse(localStorage.getItem('userData')!);

    if(!userData){     
      return;
    }
    
    const loadedUser = new User(
      userData.email,
      userData.id,
      userData.refreshToken
    )

    this.handleAuth(loadedUser.email, loadedUser.id, loadedUser.refreshToken);

    this._firebaseAuth.onAuthStateChanged(user => {
      if(user?.email == loadedUser.email && user.uid == loadedUser.id && user.refreshToken == loadedUser.refreshToken) {
        // this.handleAuth(loadedUser.email, loadedUser.id, loadedUser.refreshToken)
      } else {
        this.logout();
      }
    })
  }

  errorHandler(error: any){
    switch(error.code){
      case 'auth/email-already-exists': {
        this.errorMsg = 'Already has a registration with this email!';
        this.errorMsgSubject.next(this.errorMsg);
        break;
      }
      case 'auth/user-not-found': {
        this.errorMsg = 'Wrong email or password!';
        this.errorMsgSubject.next(this.errorMsg);
        break;
      }
      case 'auth/wrong-password': {
        this.errorMsg = 'Wrong email or password!';
        this.errorMsgSubject.next(this.errorMsg);
        break;
      }
      default: {
        this.errorMsg = 'Unknown Error';
        this.errorMsgSubject.next(this.errorMsg);
        break
      }      
    }
  }

  handleAuth(email:string, id: string, refreshToken: string){
    const user = new User(email, id, refreshToken);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}