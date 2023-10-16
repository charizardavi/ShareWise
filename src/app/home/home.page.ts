// home.page.ts
import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { environment } from 'src/environments/environment';
import { HttpClient } from "@angular/common/http";

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class HomePage implements AfterViewInit {
  ticker: string = 'AAPL';
  API_KEY = environment.API_KEY;
  baseUrl = "https://financialmodelingprep.com/api/v3";
  stockChart!: Chart;

  constructor(private http: HttpClient) {}

  ngOnInit(){
    this.fetchData();
  }

  ngAfterViewInit() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    this.stockChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Stock Price',
          data: [],
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false,
          pointHitRadius: 10
        }]
      },
      options: {
        responsive: true,
        // ... other options
      }
    });

    setTimeout(() => {
      const chartContainer = document.getElementById('chartContainer')!;
      chartContainer.className = 'shrink';
    }, 500);  // Delay of 2 seconds before starting the shrink animation
  }

  fetchData() {
    this.http
      .get<HistoricalResponse>(
        `${this.baseUrl}/historical-price-full/${this.ticker}?to=2022-02-02&from=2017-02-02&apikey=${this.API_KEY}`
      )
      .subscribe((res) => {
        const history = res.historical;
  
        this.stockChart.data.labels = [];
        this.stockChart.data.datasets[0].data = [];
  
        const nth = 5;  // Change this value to include more or fewer points
  
        for (let i = 0; i < history.length; i += nth) {
          const entry = history[i];
          this.stockChart.data.labels.push(entry.date);
          this.stockChart.data.datasets[0].data.push(entry.close);
        }
  
        this.stockChart.data.labels.reverse();
        this.stockChart.data.datasets[0].data.reverse();
        this.stockChart.update();
      });
  }

}
interface HistoricalResponse {
  historical: Array<{ date: string; close: number }>;
}