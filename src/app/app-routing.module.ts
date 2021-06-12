import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: '/companies', pathMatch: 'full'},
  {path: 'companies', loadChildren: () => import ('./companies/companies.module').then(m => m.CompaniesModule)},
  {path: 'manage-companies', loadChildren: () => import ('./manage-companies/manage-companies.module').then(m => m.ManageCompaniesModule)},
  {path: '**', redirectTo: '/companies'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
