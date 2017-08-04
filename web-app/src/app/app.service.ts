import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from "@angular/http";

@Injectable()
export class AppService {

  private _headers: Headers;
  private _url: string = ''

  constructor(private _http: Http) { 
    this._headers = new Headers();
    this._headers.append('Content-Type', 'application/json');

    this._url = "http://192.168.42.1:3000/";
  }

  public getJSON(): Observable<any[]> {
    return this._http.get(this._url).map(res => res.json());
  }
}
