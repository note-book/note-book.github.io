import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './shared/services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  title = 'Note Book';

  constructor(
    private _firestore: FirestoreService
  ){}

  ngOnInit() {
    this._firestore.getCompaniesAndTabs();
  }
}
