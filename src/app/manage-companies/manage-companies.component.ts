import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase/app';

import { Company, Tabs } from '../shared/models/company.model';
import { FirestoreService } from '../shared/services/firestore.service';
import { GenerateIdService } from '../shared/services/generateId.service';

@Component({
  selector: 'app-manage-companies',
  templateUrl: './manage-companies.component.html',
  styleUrls: [],
})
export class ManageCompaniesComponent implements OnInit, OnDestroy {
  private _companiesSubscription!: Subscription;
  showCompanyForm: boolean = false;
  currentCompanyForEdit!: Company;
  companies: Company[] = [];
  addCompanyForm!: FormGroup;
  companyTabs: FormArray = new FormArray([
    new FormGroup({
      tabName: new FormControl(null, Validators.required),
      tabOrder: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[1-9]+[1-9]*$/),
      ]),
    }),
  ]);
  isInEditMode: boolean = false;

  editMode: boolean = false;
  deletePopup: boolean = false;
  deleteParameter: string = '';
  currentTabName: string = '';
  currnetCompany: any = [];
  currentTabId: any = '';
  currentTabIds: any = [];
  shownOptions: any = '';

  constructor(
    private _firestore: FirestoreService,
    private _generateId: GenerateIdService
  ) {}

  ngOnInit(): void {
    this.addCompanyForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      tabs: this.companyTabs,
    });

    this._companiesSubscription = this._firestore.companiesSubject.subscribe(
      (data) => {
        this.companies = data;
      }
    );
  }

  ngOnDestroy() {
    this._companiesSubscription.unsubscribe();
  }

  addCompany(addCompanyForm: FormGroup) {
    if (this.addCompanyForm.invalid) {
      return;
    }

    const id = this._generateId.generateId();
    const name = addCompanyForm.value.name;
    const date = firebase.default.firestore.Timestamp.now();
    const company: Company = { name, date };

    const tabs = addCompanyForm.value.tabs;

    this._firestore.addCompany(id, company).then(() => {
      if (tabs.length == 0) {
        this.resetCompanyForm(tabs.length);
      }

      let afterCompanyIsAdded = new Promise<void>(resolve => {
        for (let i = 0; i < tabs.length; i++) {
          const tabId = this._generateId.generateId();
          const tabName = tabs[i].tabName;
          const tabOrder = tabs[i].tabOrder;
          const tabDescription = '<p></p>';
          const currentTab: Tabs = { tabName, tabOrder, tabDescription };
          this._firestore.addCompanyTabs(id, tabId, currentTab).then(() => {            
            if (i == tabs.length - 1) {
              resolve();
            }
          });
        }
      })
      afterCompanyIsAdded.then(() => {
        this.resetCompanyForm(tabs.length);        
      })
    });
  }

  saveChanges(addCompanyForm: FormGroup) {
    if (this.addCompanyForm.invalid) {
      return;
    }    

    const id = this.currnetCompany.id;
    const name = addCompanyForm.value.name;
    const company: Company = { id, name };

    const tabs = addCompanyForm.value.tabs;
    
    if (this.currentTabIds.length == 0) {
      for (let i = 0; i < tabs.length; i++) {
        const newIdTab = this._generateId.generateId();
        const tabDescription = '<p></p>';
        const tabName = tabs[i].tabName;
        const tabOrder = tabs[i].tabOrder;
        const newTab = {tabName, tabOrder, tabDescription};

        this._firestore.addCompanyTabs(id, newIdTab, newTab).then(() => {
          if (i == tabs.length - 1) {                
            this.resetCompanyForm(tabs.length);
            this.currnetCompany = [];
            this.currentTabIds = [];
          }
        });
      }
    }

    this._firestore.editCompany(id, company).then(() => {
      let afterTabsChangePromise = new Promise<void>((resolve) => {
        for (let i = 0; i < this.currentTabIds.length; i++) {
          const tabId = this.currentTabIds[i];
          const tabName = tabs[i].tabName;
          const tabOrder = tabs[i].tabOrder;
          const currentTab: Tabs = { tabName, tabOrder };
          this._firestore.editCompanyTabs(id, tabId, currentTab).then(() => {
            if (i == this.currentTabIds.length - 1) {
              resolve();
            }
          });
        }
      });

      afterTabsChangePromise.then(() => {
        if (this.currentTabIds.length == tabs.length) {
          this.resetCompanyForm(tabs.length);
          this.currnetCompany = [];
          this.currentTabIds = [];
          return;
        }

        let afterNewTabsAreAddedPromis = new Promise<void>(resolve => {
          for (let j = this.currentTabIds.length; j < tabs.length; j++) {
            const newIdTab = this._generateId.generateId();
            const tabDescription = '<p></p>';
            const tabName = tabs[j].tabName;
            const tabOrder = tabs[j].tabOrder;
            const newTab = {tabName, tabOrder, tabDescription}
            
            this._firestore.addCompanyTabs(id, newIdTab, newTab).then(() => {
              if (j == tabs.length - 1) {                
                resolve();
              }
            });
          }
        })

        afterNewTabsAreAddedPromis.then(() => {
          this.resetCompanyForm(tabs.length);
          this.currnetCompany = [];
          this.currentTabIds = [];
        })
      });
    });
  }

  cancelCompanyForm() {
    this.resetCompanyForm(this.addCompanyForm.value.tabs.length);
    this.currnetCompany = [];
    this.currentTabIds = [];
  }

  addNewTab() {
    (<FormArray>this.addCompanyForm.get('tabs')).push(
      new FormGroup({
        tabName: new FormControl(null, Validators.required),
        tabOrder: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[1-9]*$/),
        ]),
      })
    );
  }

  deleteTab(index: number) {
    this.companyTabs.removeAt(index);
  }

  getControls() {
    return (<FormArray>this.addCompanyForm.get('tabs')).controls;
  }

  resetCompanyForm(tabs: number) {
    this.showCompanyForm = false;
    this.editMode = false;

    this.addCompanyForm.reset();

    for (let i = 1; i < tabs; i++) {
      this.deleteTab(1);
    }
  }

  confirmToDelete(
    elementForDelete: string,
    company: any,
    tabId?: any,
    tabName?: any
  ) {
    this.currnetCompany = company;
    this.currentTabName = tabName;
    this.deletePopup = true;
    this.currentTabId = tabId;

    if (elementForDelete == 'company') {
      this.deleteParameter = 'company';
    } else {
      this.deleteParameter = 'tab';
    }
  }

  deleteCompany() {
    if (localStorage.getItem('company') == this.currnetCompany.id) {
      localStorage.removeItem('company');
      localStorage.removeItem('tab');
    }
    if (this.currnetCompany.tabs.length == 0) {
      this._firestore.deleteCompany(this.currnetCompany.id).then(() => {
        this.resetDeletePopup();
      });    
    }
    let promise = new Promise<void>(resolve => {
      for (let i = 0; i < this.currnetCompany.tabs.length; i++) {        
        this._firestore.deleteCompanyTab(this.currnetCompany.id, this.currnetCompany.tabs[i].id)
        .then(() => {
          if (this.currnetCompany.tabs.length == 0) {
            resolve()
          }          
        })
      }
    })
    promise.then(() => {
      this._firestore.deleteCompany(this.currnetCompany.id).then(() => {
        this.resetDeletePopup();   
      });      
    })
  }

  deleteCompanyTab() {
    this._firestore
    .deleteCompanyTab(this.currnetCompany.id, this.currentTabId)
    .then(() => {
      if (localStorage.getItem('tab') == this.currentTabId && this.currnetCompany.tabs.length > 0) {
        localStorage.setItem('tab', this.currnetCompany.tabs[0].id)
      }      
      this.resetDeletePopup();
    });
  }

  resetDeletePopup() {
    this.deletePopup = false;
    this.deleteParameter = '';
    this.currentTabName = '';
    this.currnetCompany = [];
    this.currentTabId = '';
  }

  edit(company: Company) {
    this.deleteTab(0);
    this.currnetCompany = company;
    
    this.addCompanyForm.controls['name'].setValue(company.name);
    for (let i = 0; i < company.tabs!.length; i++) {
      this.currentTabIds.push(company.tabs![i].id);
      (<FormArray>this.addCompanyForm.get('tabs')).push(
        new FormGroup({
          tabName: new FormControl(
            company.tabs![i].tabName,
            Validators.required
          ),
          tabOrder: new FormControl(company.tabs![i].tabOrder, [
            Validators.required,
            Validators.pattern(/^[1-9]+[1-9]*$/),
          ]),
        })
      );
    }
    this.editMode = true;
  }

  deleteOptions(tabWIthShownOptions: any) {
    this.isInEditMode=!this.isInEditMode;
    if (this.isInEditMode){
      this.shownOptions = tabWIthShownOptions;
    } else {
      this.shownOptions = '';
    }
  }
}
