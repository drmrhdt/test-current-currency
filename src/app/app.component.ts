import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { Valute } from './models';
import { CurrencyService } from './services/currency.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  currentCurrency$: Observable<Valute>;

  constructor(private _currencyService: CurrencyService) {}

  ngOnInit() {
    this.currentCurrency$ = this._currencyService.currentCurrency$;
  }
}
