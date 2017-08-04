import { Component, ElementRef, OnInit } from '@angular/core';
import { Http, Headers, Response } from "@angular/http";
import {AppService} from "./app.service"
import * as express from "express";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  homeJSON = [];

  constructor(private chatMessage: AppService) {
    this.chatMessage.getJSON().subscribe(
      (homeJSON) => this.homeJSON = homeJSON,
      (error) => console.error(error)
    );
  }

  ngOnInit() {
    this.homeJSON.forEach(function(roomJSON, i) {
      var roomID = roomJSON.id + "Sound";
      var visibility = roomJSON.presence > 0 ? 'visible': 'hidden';
      this.setImageVisible(roomID, visibility);
    });
  }

  ngAfterViewChecked() {
    this.homeJSON.forEach(function(roomJSON, i) {
      var roomID = roomJSON.id + "Sound";
      var visibility = roomJSON.presence > 0 ? 'visible': 'hidden';
      this.setImageVisible(roomID, visibility);
    });
  }

  setImageVisible(id, visibility) {
    document.getElementById(id).style.visibility = visibility;
  }

  title = 'app';
}
