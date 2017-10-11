import {AfterContentChecked, Component, OnInit } from '@angular/core';
import {AppService} from '../app.service'

@Component({
  selector: 'app-rooms-state-fmr',
  templateUrl: './rooms-state-fmr.component.html',
  styleUrls: ['./rooms-state-fmr.component.css']
})
export class RoomsStateFMRComponent implements OnInit, AfterContentChecked {
  homeJSON : any[] = [];
  count: number = 0;
  houseSound :string = "../../assets/home_button.png";

  constructor(private appMessage: AppService) { 
    this.appMessage.getJSON().subscribe(
      (homeJson) => this.homeJSON = homeJson,
      (error) => console.log(error)
    );
  }

  ngOnInit() {
  }

  ngAfterContentChecked(){
  this.updateSound();
}
  
  updateSound(){
    this.homeJSON.forEach(roomJson=>{
      var image = roomJson.room + '_button.png';
      this.houseSound = roomJson.presence >0 ? "../../assets/"+image :this.houseSound;
      if(roomJson.presence>0){
        this.count++;
      }
    });
    if(this.count==0){
        this.houseSound = "../../assets/home_button.png";
    }
    this.count=0;
  }

}
