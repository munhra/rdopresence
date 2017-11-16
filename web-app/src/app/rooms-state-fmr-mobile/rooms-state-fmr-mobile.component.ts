import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { AppService } from '../app.service'

@Component({
  selector: 'app-rooms-state-fmr-mobile',
  templateUrl: './rooms-state-fmr-mobile.component.html',
  styleUrls: ['./rooms-state-fmr-mobile.component.css']
})
export class RoomsStateFmrMobileComponent implements OnInit, AfterContentChecked {

  homeJSON : any[] = [];
  count: number = 0;
  roomState: string = '../../assets/home_buttonMobile.png';

  constructor(private appMessage: AppService) {
    this.appMessage.getJSON().subscribe(
      (homeJson) => this.homeJSON =homeJson,
      (error) => console.log(error)
    );
   }

  ngOnInit() {
  }

  ngAfterContentChecked(){
    this.updateState();
  }

  updateState(){
    this.homeJSON.forEach(roomJson=>{
      var image = roomJson.room + '_buttonMobile.png';
      this.roomState = roomJson.presence >0 ? "../../assets/"+image :this.roomState;
      if(roomJson.presence>0){
        this.count++;
      }
    });
    if(this.count==0){
        this.roomState = "../../assets/home_buttonMobile.png";
    }
    this.count=0;
  }

}
