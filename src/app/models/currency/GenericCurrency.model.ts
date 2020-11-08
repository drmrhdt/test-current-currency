import { Observable } from 'rxjs';
import { Valute } from '../index';

export interface GenericCurrency {
  getCurrency(): Observable<Valute>;
}
