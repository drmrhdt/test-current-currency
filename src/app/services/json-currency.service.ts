import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { GenericCurrency, RowValuteData, Valute } from '../models';

@Injectable({
  providedIn: 'root',
})
export class JsonCurrencyService implements GenericCurrency {
  constructor(private _httpClient: HttpClient) {}

  getCurrency(): Observable<Valute> {
    return this._httpClient
      .get('https://www.cbr-xml-daily.ru/daily_json.js')
      .pipe(
        map((res: RowValuteData) => {
          const valutesEntries = Object.entries(res.Valute);

          for (const valute of valutesEntries) {
            if (valute[0] === 'EUR') {
              return {
                CharCode: valute[0],
                Value: valute[1].Value,
                Name: valute[1].Name,
              };
            }
          }
        })
      );
  }
}
