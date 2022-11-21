import { Component, OnInit} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit{
  priceEUR:Number = 0;
  priceGBP:Number = 0;
  priceUSD:Number = 0;
  priceChangeColor = "";
  cryptoData = [];
  currency = 'GBP';
  currentCurrency = "EUR";
  currencyOptions = [
    {name: 'EUR', value:"EUR"},
    {name: 'GBP', value:"GBP"},
    {name: 'USD', value:"USD"}
  ];
  pastDataEUR = [];
  pastDataUSD = [];
  pastDataGBP = [];

  id:any = 0;

  apiUrl = "https://api.coindesk.com/v1/bpi/currentprice.json";

  constructor(private http: HttpClient){}

  ngOnInit(): void {
    this.fetchData();
    this.id = setInterval(() =>{
      this.fetchData();
    }, 10000);
  }

  ngOnDestroy(){
    if(this.id){
      clearInterval(this.id)
    }
  }

  getPriceChange(){
    let pastPrice = this.pastDataEUR[this.pastDataEUR.length - this.pastDataEUR.length + 1].price;
    let currentPrice = this.priceEUR;
    if(pastPrice < currentPrice){
      this.priceChangeColor = "lightgreen";
    } else if(pastPrice > currentPrice){
      this.priceChangeColor = "pink";
    } else {
      this.priceChangeColor = "white";
    }
  }

  addPastData(){
    let currentTime = new Date();
    let rowColor = "";

    if(this.pastDataEUR.length > 0){
      let prevPrice = this.pastDataEUR[0].price;
      let currentPrice = this.priceEUR;
      if(prevPrice < currentPrice){
        rowColor = "lightgreen";
      } else if(prevPrice > currentPrice){
        rowColor = "pink";
      } else {
        rowColor = "#efefef";
      }
    }

    this.pastDataEUR.unshift.call(this.pastDataEUR, {time: currentTime.toLocaleTimeString('et'), price:this.priceEUR, color: rowColor})
    this.pastDataUSD.unshift.call(this.pastDataUSD, {time: currentTime.toLocaleTimeString('et'), price:this.priceUSD, color: rowColor})
    this.pastDataGBP.unshift.call(this.pastDataGBP, {time: currentTime.toLocaleTimeString('et'), price:this.priceGBP, color: rowColor})
  }

  private fetchData(){
    this.http.get(this.apiUrl)
    .pipe(map((res) => {
      const data = [];
      for(const key in res){
        if(key == 'bpi'){
          if(this.cryptoData.length == 0){
            for(const currencies in res[key]){
              this.cryptoData.push(res[key][currencies])
            }
          } else {
            this.cryptoData = [];
            for(const currencies in res[key]){
              this.cryptoData.push(res[key][currencies])
            }
          }
        }
      }
    }))
    .subscribe(() => {
      this.priceEUR = this.cryptoData[2].rate;
      this.priceGBP = this.cryptoData[1].rate;
      this.priceUSD = this.cryptoData[0].rate;
      this.addPastData();
      this.getPriceChange();
    })
  }
}
