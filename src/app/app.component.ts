import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, of, BehaviorSubject, timer, Subject } from 'rxjs';
import { catchError, mergeMap, share, takeUntil } from 'rxjs/operators';

import { CurrencyService } from './services/currency.service';

import { Valute } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  currencyData$: Observable<Valute>;

  private _formats = ['xml', 'json'];
  private _currentFormat = new BehaviorSubject(this._formats[0]);
  private _unsubscriber$ = new Subject();

  constructor(private _currencyService: CurrencyService) {}

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
    this.currencyData$ = timer(0, 10000).pipe(
      mergeMap(() => {
        switch (this._currentFormat.value) {
          case 'json':
            return this._currencyService.getCurrency();
          case 'xml':
            return this._currencyService.getCurrencyXml();
          default:
            this._currencyService.getCurrency();
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
