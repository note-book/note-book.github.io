import { Component, OnInit } from '@angular/core';

import { AuthService } from './shared/services/auth.service';
import { FirestoreService } from './shared/services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  title = 'Note Book';

  constructor(
    private _firestore: FirestoreService,
    private _authService: AuthService
  ){}

  ngOnInit() {
    this._firestore.getCompaniesAndTabs();
    this._authService.autoLogin();
  }
}
