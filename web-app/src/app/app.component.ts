import {AfterViewChecked, Component, ElementRef, OnInit } from '@angular/core';
import { Http, Headers, Response } from "@angular/http";
import {AppService} from "./app.service"
import * as express from "express";
import * as io from 'socket.io-client';
import 'rxjs/Rx';
import { HeaderFmrComponent } from './header-fmr/header-fmr.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  homeJSON: any[] = [];
  audio;

  constructor(private appMessage: AppService) {
    this.appMessage.getJSON().subscribe(
      (homeJSON) => this.homeJSON = homeJSON,
      (error) => console.error(error)
    );
  }

  ngOnInit() {
    this.updateVisibility();
  }

  ngAfterViewChecked() {
    this.updateVisibility();
  }

  updateVisibility() {
    this.homeJSON.forEach(function(roomJSON, i) {
      var roomID = roomJSON.room + "Sound";
      var visibility = roomJSON.presence > 0 ? 'visible': 'hidden';
      document.getElementById(roomID).style.visibility = visibility;
    });
  }

  title = 'app';
}
