import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as converter from 'xml-js';

import { Valute, RowValuteData } from './models';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
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

  getCurrencyXml(): Observable<Valute> {
    return this._httpClient
      .get('https://www.cbr-xml-daily.ru/daily_utf8.xml', {
        responseType: 'text',
      })
      .pipe(
        map((res) => {
          function nativeType(value) {
            const nValue = Number(value);
            if (!isNaN(nValue)) {
              return nValue;
            }
            const bValue = value.toLowerCase();
            if (bValue === 'true') {
              return true;
            } else if (bValue === 'false') {
              return false;
            }
            return value;
          }

          const removeJsonTextAttribute = function (value, parentElement) {
            try {
              const keyNo = Object.keys(parentElement._parent).length;
              const keyName = Object.keys(parentElement._parent)[keyNo - 1];
              parentElement._parent[keyName] = nativeType(value);
            } catch (e) {}
          };

          return converter.xml2json(res, {
            spaces: 2,
            compact: true,
            trim: true,
            nativeType: true,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreAttributes: true,
            ignoreComment: true,
            ignoreCdata: true,
            ignoreDoctype: true,
            textFn: removeJsonTextAttribute,
          });
        }),
        map((res) => {
          const parsedRes = JSON.parse(res);
          const euro = parsedRes.ValCurs.Valute.find(
            (element) => element.CharCode === 'EUR'
          );
          // imitate error
          // throw Error;
          return {
            CharCode: euro.CharCode,
            Name: euro.Name,
            Value: euro.Value,
          };
        })
      );
  }
}
