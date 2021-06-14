import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Company, Tabs } from '../shared/models/company.model';
import { FirestoreService } from '../shared/services/firestore.service';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: []
})
export class CompaniesComponent implements OnInit, OnDestroy {
  private _companiesSubscription!: Subscription;
  companies: Company[] = [];
  tabDescriptionForm!: FormGroup;
  companyIdForSubmit!: string;
  tabIdForSubmit!: string;
  currentDescription!: string;
  isInEditMode: boolean = false;
  unsavedChangesPupup: boolean = false;
  currentCompany: any = '';
  currentTab: any = '';
  currentDes: any = '';
  autoSave: any = '';
  editor!: Editor;
  html!: any;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }]
  ];

  constructor(
    private _firestore: FirestoreService
  ) { }

  ngOnInit(): void {
    this._companiesSubscription = this._firestore.companiesSubject.subscribe(data => {
      this.companies = data;
    
      let promise = new Promise<void>(resolve => {
        if (this.companies != null && this.companies.length) {
          resolve()
        }
      })

      promise.then(() => {
        if (!localStorage.getItem('company')) {
          this.currentCompany = this.companies[0].id;
          localStorage.setItem('company', this.currentCompany);
        } else {
          this.currentCompany = localStorage.getItem('company');        
        }
        
        this._firestore.getTabs(this.companies[0].id).subscribe(data => {
          const tabs: Tabs[] = data.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as Tabs
            }
          })
          tabs.sort(function(a, b) {
            return a.tabOrder - b.tabOrder;
          })
          if (!localStorage.getItem('tab') && tabs.length) {
            this.currentTab = tabs[0].id;
            localStorage.setItem('tab', this.currentTab);
          } else {
            this.currentTab = localStorage.getItem('tab');        
          }      
        })
      })
    });

    this.tabDescriptionForm = new FormGroup({
      tabDescription: new FormControl()
    })
  }

  ngOnDestroy() {
    this._companiesSubscription.unsubscribe();
  }

  editDescription(companyId: any, tabId: any, tabDescription: any) {
    this.editor = new Editor();

    this.companyIdForSubmit = companyId;
    this.tabIdForSubmit = tabId;
    this.currentDescription = tabDescription;
    this.tabDescriptionForm.controls['tabDescription'].setValue(this.currentDescription);
    this.isInEditMode = true;    

    this.autoSave = setInterval(() => {
      this.save();      
    }, 5*60*1000);
  }

  submitChange() {
    this._firestore
    .saveChange(this.companyIdForSubmit, this.tabIdForSubmit, this.tabDescriptionForm.value.tabDescription)
    .then(() => {
      this.resetForm()
    });
    clearInterval(this.autoSave);
  }

  save() {
    this._firestore
    .saveChange(this.companyIdForSubmit, this.tabIdForSubmit, this.tabDescriptionForm.value.tabDescription)
    .then(() => {
      this.currentDescription =this.tabDescriptionForm.value.tabDescription;
    })
  }

  closelPopup() {
    if (this.currentDescription != this.tabDescriptionForm.value.tabDescription) {
      this.unsavedChangesPupup = true;      
    } else {
      this.resetForm();
    }
    clearInterval(this.autoSave);
  }

  resetForm() {
    this.tabDescriptionForm.reset();
    this.isInEditMode = false;
    this.unsavedChangesPupup = false;
    this.editor.destroy();
  }

  activeCompany(company: any) {
    this.currentCompany = company.id;
    this.currentTab = company.tabs[0].id;
    localStorage.setItem('company', this.currentCompany);
    localStorage.setItem('tab', this.currentTab);
  }

  activeTab(tabId: any) {
    this.currentTab = tabId;
    localStorage.setItem('tab', tabId);
  }
}
