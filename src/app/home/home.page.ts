// home.page.ts
import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

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
  baseUrl = 'https://financialmodelingprep.com/api/v3';
  stockChart!: Chart;
  showSMA: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  ngAfterViewInit() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    this.stockChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Stock Price',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
            pointHitRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        // ... other options
      },
    });

    setTimeout(() => {
      const chartContainer = document.getElementById('chartContainer')!;
      chartContainer.className = 'shrink';
    }, 500); // Delay of 2 seconds before starting the shrink animation
  }

  fetchData() {
    this.http
      .get<HistoricalResponse>(
        `${this.baseUrl}/historical-price-full/${this.ticker}?to=2023-10-02&from=2022-01-02&apikey=${this.API_KEY}`
      )
      .subscribe((res) => {
        const history = res.historical;

        // Reset datasets to initial state
        this.stockChart.data.labels = [];
        this.stockChart.data.datasets = [
          {
            label: 'Stock Price',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
            pointHitRadius: 10,
          },
        ];

        const smaData: number[] = [];
        const nth = 1;

        for (let i = 0; i < history.length; i += nth) {
          const entry = history[i];
          this.stockChart.data.labels.push(entry.date);
          this.stockChart.data.datasets[0].data.push(entry.close);
        }

        // Calculate 200-day SMA
        for (let i = 199; i < history.length; i += nth) {
          // Adjusted the starting index
          let sum = 0;
          for (let j = i; j > i - 200; j -= nth) {
            // Adjusted the ending index
            sum += history[j].close;
          }
          smaData.push(sum / 200);
        }

        this.stockChart.data.labels.reverse();
        this.stockChart.data.datasets[0].data.reverse();
        smaData.reverse();

        this.stockChart.data.labels = this.stockChart.data.labels.slice(200); // Adjusted to match SMA data length
        this.stockChart.data.datasets[0].data =
          this.stockChart.data.datasets[0].data.slice(200); // Adjusted to match SMA data length

        // Add SMA data to chart
        this.stockChart.data.datasets.push({
          label: '200-day SMA',
          data: smaData,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          fill: false,
          // pointHitRadius: 10,
          pointRadius: 0
        });

        this.stockChart.update();
      });
  }

  toggleSMA() {
    const smaDataset = this.stockChart.data.datasets.find(dataset => dataset.label === '200-day SMA');
    if (smaDataset) {
      smaDataset.hidden = !this.showSMA;  // Toggle the hidden property based on the checkbox value
      this.stockChart.update();
    }
  }
}
interface HistoricalResponse {
  historical: Array<{ date: string; close: number }>;
}
