import {injectable, BindingScope} from '@loopback/core';
import * as XLSX from 'xlsx';
import {repository} from '@loopback/repository';

@injectable({scope: BindingScope.TRANSIENT})
export class ExcelImportService {
  constructor() {}
  //
}
