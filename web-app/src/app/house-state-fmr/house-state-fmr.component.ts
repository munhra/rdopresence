import { AfterViewChecked, ElementRef, Component, OnInit } from '@angular/core';
import {AppService} from '../app.service'

@Component({
  selector: 'app-house-state-fmr',
  templateUrl: './house-state-fmr.component.html',
  styleUrls: ['./house-state-fmr.component.css']
})
export class HouseStateFMRComponent implements OnInit, AfterViewChecked {
  homeJSON: any[] = [];
  houseRoom: string = "../../assets/home_house.png";

  constructor(private appMessage: AppService) {
  this.appMessage.getJSON().subscribe(
    (homeJson) => this.homeJSON = homeJson,
    (error) => console.log(error)
  );
  }

  ngOnInit() {
    
  }

  ngAfterViewChecked(){
    this.toogleImages();
  }


  toogleImages(){
    var room;
    var image
    this.homeJSON.forEach(roomJson=>{
       image = roomJson.room +'_house.png';
       this.houseRoom = roomJson.presence >0 ? "../../assets/"+image: this.houseRoom;
      console.log(this.houseRoom);
    });
    
  }
}
