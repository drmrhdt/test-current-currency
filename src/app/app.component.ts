import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, of, BehaviorSubject, timer, Subject } from 'rxjs';
import { catchError, mergeMap, share, takeUntil } from 'rxjs/operators';

import { JsonCurrencyService } from './services/json-currency.service';
import { XmlCurrencyService } from './services/xml-currency.service';

import { Valute } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  currentCurrency$: Observable<Valute>;

  private _formats = ['xml', 'json'];
  private _currentFormat = new BehaviorSubject(this._formats[0]);
  private _unsubscriber$ = new Subject();

  constructor(
    private _jsonCurrencyService: JsonCurrencyService,
    private _xmlCurrenyService: XmlCurrencyService
  ) {}

  ngOnInit() {
    this._currentFormat
      .pipe(takeUntil(this._unsubscriber$))
      .subscribe(() => this._getCurrency());
  }

  ngOnDestroy() {
    this._unsubscriber$.next(true);
    this._unsubscriber$.complete();
  }

  private _getCurrency() {
    this.currentCurrency$ = timer(0, 10000).pipe(
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
        const _currentFormatIndex = this._formats.findIndex(
          (i) => i === this._currentFormat.value
        );
        this._currentFormat.next(
          this._formats[(_currentFormatIndex + 1) % this._formats.length]
        );
        return of(err);
      }),
      share()
    );
  }
}
