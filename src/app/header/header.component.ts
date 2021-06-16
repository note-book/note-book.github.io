import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit, OnDestroy {
  private _subUser!: Subscription;
  isAuth: boolean = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._subUser = this._authService.user.subscribe(user => {
      this.isAuth = !user ? false : true;
     })
  }

  ngOnDestroy() {
    this._subUser.unsubscribe();
  }

  logout() {
    this._authService.logout();
    this._router.navigate(['/login']);
  }
}
