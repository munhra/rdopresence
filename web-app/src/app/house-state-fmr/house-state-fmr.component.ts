import {AfterContentChecked, Component, OnInit } from '@angular/core';
import {AppService} from '../app.service'

@Component({
  selector: 'app-house-state-fmr',
  templateUrl: './house-state-fmr.component.html',
  styleUrls: ['./house-state-fmr.component.css']
})
export class HouseStateFMRComponent implements OnInit, AfterContentChecked {
  homeJSON: any[] = [];
  count: number = 0 ;
  houseRoom: string = "../../assets/home_house.png";
  houseMobile: string = "../../assets/home_houseMobile.png";

  constructor(private appMessage: AppService) {
  this.appMessage.getJSON().subscribe(
    (homeJson) => this.homeJSON = homeJson,
    (error) => console.log(error)
  );
  }

  ngOnInit() {
    
  }

  ngAfterViewChecked(){
   
  }

  ngAfterContentChecked(){
    this.updateHouse();
  }

  updateHouse(){
    var room;
    var imageTablet;
    var imageMobile;
    this.homeJSON.forEach(roomJson=>{
      imageTablet = roomJson.room + '_house.png';
      imageMobile = roomJson.room + '_houseMobile.png';
       this.houseRoom = roomJson.presence >0 ? "../../assets/"+imageTablet: this.houseRoom;
       this.houseMobile = roomJson.presence >0 ? "../../assets/"+imageMobile: this.houseMobile;
        if(roomJson.presence>0) {
          this.count++;
        }
    });
    if(this.count==0){
      this.houseRoom = "../../assets/home_house.png";
      this.houseMobile = "../../assets/home_houseMobile.png";
    }
    this.count=0;
  }
}
