import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Root components
import { FrameComponent } from './frame/frame.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', component: FrameComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      enableTracing: true,
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
