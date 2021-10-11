import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';

import { HomeComponent } from './home/home.component';
import { FrameComponent } from './frame/frame.component';

@NgModule({
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  declarations: [AppComponent, HelloComponent, HomeComponent, FrameComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
