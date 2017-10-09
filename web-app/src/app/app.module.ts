import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {AppService} from "./app.service";
import { HeaderFmrComponent } from './header-fmr/header-fmr.component';
import { HouseStateFMRComponent } from './house-state-fmr/house-state-fmr.component';
import { RoomsStateFMRComponent } from './rooms-state-fmr/rooms-state-fmr.component'

@NgModule({
  declarations: [
    AppComponent,
    HeaderFmrComponent,
    HouseStateFMRComponent,
    RoomsStateFMRComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
