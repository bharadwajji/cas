import {Component, OnInit, Input} from '@angular/core';
import {Messages} from "../../messages";
import {AbstractRegisteredService} from "../../../domain/registered-service";
import {Data} from "../data";
import {DataSource} from "@angular/cdk";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import {Util} from "../../util/util";
import {DefaultRegisteredServiceProperty} from "../../../domain/property";

@Component({
  selector: 'app-propertiespane',
  templateUrl: './propertiespane.component.html',
  styleUrls: ['./propertiespane.component.css']
})
export class PropertiespaneComponent implements OnInit {
  displayedColumns = ['source', 'mapped', "delete"];
  attributeDatabase = new AttributeDatabase();
  dataSource: AttributeDataSource | null;


  constructor(public messages: Messages,
              public data: Data) {
  }

  ngOnInit() {

    if (Util.isEmpty(this.data.service.properties)) {
      this.data.service.properties = new Map();
    }
    for (let p of Array.from(Object.keys(this.data.service.properties))) {
      this.attributeDatabase.addRow(new Row(p));
    }
    this.dataSource = new AttributeDataSource(this.attributeDatabase);
  }

  addRow(){
    this.attributeDatabase.addRow(new Row(""));
  }

  doChange(row: Row, val: string) {
    if(Object.keys(this.data.service.properties).indexOf(row.key as string) > -1) {
      this.data.service.properties[val] = this.data.service.properties[row.key as string];
      delete this.data.service.properties[row.key as string];
    } else {
      this.data.service.properties[val] = new DefaultRegisteredServiceProperty();
    }
    row.key = val;
  }

  delete(row: Row) {
    delete this.data.service.properties[row.key as string];
    this.attributeDatabase.removeRow(row);
  }
}

export class Row {
  key: String;

  constructor(source: String) {
    this.key = source;
  }
}

export class AttributeDatabase {
  dataChange: BehaviorSubject<Row[]> = new BehaviorSubject<Row[]>([]);
  get data(): Row[] { return this.dataChange.value; }

  constructor() {
  }

  addRow(row: Row) {
    const copiedData = this.data.slice();
    copiedData.push(row);
    this.dataChange.next(copiedData);
  }

  removeRow(row: Row) {
    const copiedData = this.data.slice();
    copiedData.splice(copiedData.indexOf(row),1);
    this.dataChange.next(copiedData);
  }
}

export class AttributeDataSource extends DataSource<any> {
  constructor(private _attributeDatabase: AttributeDatabase) {
    super();
  }

  connect(): Observable<Row[]> {
    return this._attributeDatabase.dataChange;
  }

  disconnect() {}
}
