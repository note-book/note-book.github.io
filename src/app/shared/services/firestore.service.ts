import { Injectable } from '@angular/core';
import { AngularFirestore  } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

import { Company, Tabs } from '../models/company.model';

@Injectable({providedIn: 'root'})
export class FirestoreService {
  companiesSubject = new BehaviorSubject<any>(null)
  companies: Company[] = [];

  constructor(
    private _firestore: AngularFirestore
  ) {}

  addCompany(id: any, company: Company) {
    return this._firestore
    .collection('companies').doc(id)
    .set(company)
  }

  addCompanyTabs(id: any, tabId: any, currentTab: Tabs) {
    return this._firestore
    .collection('companies').doc(id)
    .collection('tabs').doc(tabId)
    .set(currentTab)
  }

  editCompany(id: any, company: Company) {
    return this._firestore
    .collection('companies').doc(id)
    .update({
      name: company.name
    })
  }

  editCompanyTabs(id: any, tabId:any, currentTab: Tabs) {
    return this._firestore
    .collection('companies').doc(id)
    .collection('tabs').doc(tabId)
    .update({
      tabName: currentTab.tabName,
      tabOrder: currentTab.tabOrder
    })
  }

  getCompanies() {
    return this._firestore
    .collection('companies', data => data.orderBy('date', 'asc'))
    .snapshotChanges()
  }

  getTabs(id: any) {
    return this._firestore
    .collection('companies').doc(id)
    .collection('tabs')
    .snapshotChanges()
  }

  saveChange(companyId: string, tabId: string, tabDescription: string) {
    return this._firestore
    .collection('companies').doc(companyId)
    .collection('tabs').doc(tabId).update({
      tabDescription: tabDescription
    })
  }

  deleteCompany(companyId: any) {
    return this._firestore
    .collection('companies').doc(companyId)
    .delete()
  }

  deleteCompanyTab(companyId: any, tabId: any) {
    return this._firestore
    .collection('companies').doc(companyId)
    .collection('tabs').doc(tabId)
    .delete()
  }

  getCompaniesAndTabs() {
    this.getCompanies().subscribe(data => {
      this.companies = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as Company
        }
      })
  
      for (let i = 0; i < this.companies.length; i++) {
       this.getTabs(this.companies[i].id).subscribe(data => {
          this.companies[i].tabs = data.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as Tabs
            }
          })
          this.companies[i].tabs?.sort(function(a, b) {
            return a.tabOrder - b.tabOrder;
          })
        });   
      }
      this.companiesSubject.next(this.companies)
    });
  }
}
