import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PredictionFormComponent } from './prediction-form/prediction-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {path:'',component:PredictionFormComponent},
  {path:'dash',component:DashboardComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
