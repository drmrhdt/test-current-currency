import { Injectable } from '@angular/core';

import { BehaviorSubject, timer, of, Observable } from 'rxjs';
import { mergeMap, catchError, share } from 'rxjs/operators';

import { JsonCurrencyService } from './json-currency.service';
import { XmlCurrencyService } from './xml-currency.service';

import { Valute } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  currentCurrency$: Observable<Valute>;

  private _FORMATS = ['xml', 'json'];
  private _INTERVAL = 10000;
  private _currentFormat = new BehaviorSubject(this._FORMATS[0]);

  constructor(
    private _jsonCurrencyService: JsonCurrencyService,
    private _xmlCurrenyService: XmlCurrencyService
  ) {
    this._currentFormat.subscribe(() => this._getCurrency());
  }

  private _getCurrency() {
    this.currentCurrency$ = timer(0, this._INTERVAL).pipe(
      mergeMap(() => {
        switch (this._currentFormat.value) {
          case 'json':
            return this._jsonCurrencyService.getCurrency();
          case 'xml':
            return this._xmlCurrenyService.getCurrency();
          default:
            this._jsonCurrencyService.getCurrency();
        }
      }),
      catchError((err) => {
        const _currentFormatIndex = this._FORMATS.findIndex(
          (i) => i === this._currentFormat.value
        );
        this._currentFormat.next(
          this._FORMATS[(_currentFormatIndex + 1) % this._FORMATS.length]
        );
        return of(err);
      }),
      share()
    );
  }
}
