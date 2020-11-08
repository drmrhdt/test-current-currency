import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import * as converter from 'xml-js';

import { GenericCurrency, Valute } from '../models';

@Injectable({
  providedIn: 'root',
})
export class XmlCurrencyService implements GenericCurrency {
  constructor(private _httpClient: HttpClient) {}

  getCurrency(): Observable<Valute> {
    return this._httpClient
      .get('https://www.cbr-xml-daily.ru/daily_utf8.xml', {
        responseType: 'text',
      })
      .pipe(
        map((res) => this._convertXmlToJsonString(res)),
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

  private _convertXmlToJsonString(xml: string): string {
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
      const keyNo = Object.keys(parentElement._parent).length;
      const keyName = Object.keys(parentElement._parent)[keyNo - 1];
      parentElement._parent[keyName] = nativeType(value);
    };

    return converter.xml2json(xml, {
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
  }
}
