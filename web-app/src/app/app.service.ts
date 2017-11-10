import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from "@angular/http";
import * as io from 'socket.io-client';

import 'rxjs/Rx';

@Injectable()
export class AppService {

  private _headers: Headers;
  private _url: string = ''
  private socket;

  constructor(private _http: Http) { 
    this._headers = new Headers();
    this._headers.append('Content-Type', 'application/json');
    
    this._url = "http://192.168.42.2:3001/";
  }

  public getJSON(): Observable<any[]> {
    let observable = new Observable<any[]>(observer => {
      this.socket = io(this._url);
      this.socket.on('message', (data) => {
        observer.next(data);    
      });
      return () => {
        this.socket.disconnect();
      };  
    })     
    return observable;

  }

}
