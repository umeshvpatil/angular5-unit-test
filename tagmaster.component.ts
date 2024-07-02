import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort } from '@angular/material';
import { GlobalService } from './../services/global.service';
import { HttpService } from './../services/http.service';
import { TagMasterService } from './../services/tagmaster-service';
import { PiHistoryService } from './../services/pihistory-service';
import { TagMaster } from './../models/tagmaster.model';
import { FilterTags } from './../models/filterTag.model';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tagmaster',
  templateUrl: './tagmaster.component.html',
  styleUrls: ['./tagmaster.component.css']
})
export class TagmasterComponent implements OnInit {
  [x: string]: any;
  tagList: MatTableDataSource<TagMaster>;
  dataForFilter = new FilterTags();
  // isSubscriptionGranted: boolean = false;
  tags;
  fTags;
  noData;
  locationList;
  locCode;
  unitCode;
  unitList;
  equipmentList;
  useCaseList;
  useCaseForFilter;
  equipmentCode = "";
  tagTypeList;
  tagIdsToExport = [];
  filterErrMsg: boolean = false;
  isLoader: boolean = false;
  @ViewChild('filterTagForm') public filterTagForm: NgForm;
  @ViewChild('tagsPaginator') tagsPaginator: MatPaginator;
  @ViewChild('tagsTableSort') public tagsTableSort: MatSort;
  firstTableClass: string = "hideData";
  tagIdFilter = new FormControl('');
  r4tagNameFilter = new FormControl('');
  tagDescFilter = new FormControl('');
  locationNameFilter = new FormControl('');
  unitNameFilter = new FormControl('');
  equipmentFilter = new FormControl('');
  displayedColumns = ['export', 'tagId', 'r4tagName', 'locationName', 'unitName', 'equipmentName', 'tagDesc', 'Action'];
  disabledFlag: boolean = true;
  eqipmentPlaceHolder: string = "Equipment";

  filterValues = {
    tagId: '',
    r4tagName: '',
    locationName: '',
    unitName: '',
    equipmentName: '',
    tagDesc: '',
  };

  constructor(
    public globals: GlobalService,
    public httpService: HttpService,
    public tagMasterService: TagMasterService,
    public piHistoryService: PiHistoryService,
    public dialog: MatDialog,
    public router: Router,
    public _router: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getLocationList();
    this.getTagTypeList();
    this.getEquipmentList("");
    this.getTagList();
    this.getUseCaseList();

    this.equipmentFilter.valueChanges
      .subscribe(
        equipmentName => {
          this.filterValues.equipmentName = equipmentName;
          this.tagList.filter = JSON.stringify(this.filterValues);
        }
      )

    this.tagIdFilter.valueChanges
      .subscribe(
        tagId => {
          this.filterValues.tagId = tagId;
          this.tagList.filter = JSON.stringify(this.filterValues);
        }
      )

    this.r4tagNameFilter.valueChanges
      .subscribe(
        r4tagName => {
          this.filterValues.r4tagName = r4tagName;
          this.tagList.filter = JSON.stringify(this.filterValues);
        }
      )

    this.tagDescFilter.valueChanges
      .subscribe(
        tagDesc => {
          this.filterValues.tagDesc = tagDesc;
          this.tagList.filter = JSON.stringify(this.filterValues);
        }
      )

    this.locationNameFilter.valueChanges
      .subscribe(
        locationName => {
          this.filterValues.locationName = locationName;
          this.tagList.filter = JSON.stringify(this.filterValues);
        }
      )

    this.unitNameFilter.valueChanges
      .subscribe(
        unitName => {
          this.filterValues.unitName = unitName;
          this.tagList.filter = JSON.stringify(this.filterValues);
        }
      )
  }

  resetFilter() {
    this.filterTagForm.reset();
  }

  getUseCaseList() {
    this.tagMasterService.getUseCases().subscribe(useCaseData => {
      this.useCaseList = useCaseData;
    });

  }

  moveTagAcrossPlatform() {
    let values = {
      "Parameters": {
        "tagIds": this.tagIdsToExport,
        "userName": this.globals.loggedInUser
      }
    }

    this.tagMasterService.tagsMovement(values).subscribe((result: any): void => {
      if (String(result.value).startsWith("Success")) {
        confirm("Tag master movement request has been initiated. Please verify after sometime.");
      } else {
        this.error = true;
      }
    });
  }

  chkTagIds(event) {
    if (!this.tagIdsToExport.includes(event)) {
      this.tagIdsToExport.push(event);
    } else {
      let position = this.tagIdsToExport.indexOf(event);
      this.tagIdsToExport.splice(position, 1);
    }
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.tagId.toLowerCase().indexOf(searchTerms.tagId.toLowerCase()) !== -1
        && data.r4tagName.toLowerCase().indexOf(searchTerms.r4tagName.toLowerCase()) !== -1
        && data.tagDesc.toLowerCase().indexOf(searchTerms.tagDesc.toLowerCase()) !== -1
        && data.locationName.toLowerCase().indexOf(searchTerms.locationName.toLowerCase()) !== -1
        && data.unitName.toLowerCase().indexOf(searchTerms.unitName.toLowerCase()) !== -1
        && ((data.equipmentName != null) ? data.equipmentName.toLowerCase().indexOf(searchTerms.equipmentName.toLowerCase()) !== -1 : false);

    }
    return filterFunction;
  }

  getTagList() {
    this.tagMasterService.filteredTagList(this.locCode, this.unitCode, this.equipmentCode, this.useCaseForFilter).subscribe((tagList: any): void => {
      this.tags = tagList;
      this.fTags = tagList;
    });
  }
  getLocationList() {
    this.tagMasterService.getLocations().subscribe(locData => {
      this.locationList = locData;
    }, (error) => {
      console.log(error);
    });
  }

  locFocusOut(loc) {
    let isLocation = this.locationList.filter(function (obj) {
      return obj.locationName == loc.value;
    });
    if (isLocation.length == 0) {
      this.filterErrMsg = true;
      this.disabledFlag = true;
      this.locCode = "";
    } else {
      this.locCode = isLocation[0].locationId;
      this.filterErrMsg = false;
      this.disabledFlag = false;
    }
    this.getTagList();
  }
  getTagTypeList() {
    this.tagMasterService.getTagTypes().subscribe(tagTypeData => {
      this.tagTypeList = tagTypeData;
    }, (error) => {
      console.log(error);
    });
  }

  getUnitList(selectedLoc) {
    this.locCode = selectedLoc.item.locationId;
    if (this.locCode == "") {
      this.filterErrMsg = true;
      this.disabledFlag = true;
    } else {
      this.filterErrMsg = false;
      this.disabledFlag = false;
      this.tagMasterService.getUnits(this.locCode).subscribe(unitData => {
        this.unitList = unitData;
      }, (error) => {
        console.log(error);
      });
    }
    this.getTagList();
  }

  getUnitCode(selectedUnit) {
    this.unitCode = selectedUnit.item.unitId;
    if (this.unitCode == undefined) {
      this.unitCode = "";
      this.equipmentList = [];
    } else {
      this.getEquipmentList(this.unitCode);
      this.getTagList();
    }
  }

  unitFocusOut(unit) {
    let unitForFilter = this.reverseUnit(unit.value);
    this.unitCode = unitForFilter;
    let selectedTags = this.fTags.filter(function (obj) {
      return obj.unitId == unitForFilter;
    });
    if (selectedTags.length > 0) {
      this.tags = [];
      this.tags = selectedTags;
    }
    this.getTagList();
  }

  equipmentFocusOut(equipment) {
    if (equipment.value != "") {
      let equipmentForFilter = this.reverseEqp(equipment.value);
      this.equipmentCode = equipmentForFilter;
      let _self = this;

      let selectedTags = this.fTags.filter(function (obj) {
        return obj.equipmentId == equipmentForFilter && obj.unitId == _self.unitCode;
      });

      if (selectedTags.length > 0) {
        this.tags = [];
        this.tags = selectedTags;
      }
    } else {
      this.equipmentCode = "";
    }
    this.getTagList();


  }



  getEquipmentCode(selectedEquipment) {

    if (selectedEquipment.item.equipmentId == undefined) {
      this.equipmentCode = "";
    } else {
      this.equipmentCode = selectedEquipment.item.equipmentId;
    }
    this.getTagList();
  }

  getEquipmentList(selectedUnit) {
    this.tagMasterService.getEquipments(selectedUnit).subscribe(equipData => {
      this.equipmentList = equipData;
    });
  }

  validateUseCase(event) {
    this.useCaseForFilter = event.value;
    this.getUseCaseList();
  }

  checkUseCase(useCase) {
    if (useCase.value != '') {
      let uc = this.useCaseList.filter(function (ucObj) {
        if (ucObj.useCaseName == useCase.value) {
          return ucObj.useCaseId;
        }
      });
      this.useCaseForFilter = uc[0].useCaseId;
    } else {
      this.useCaseForFilter = "";
    }
    this.getUseCaseList();
  }

  filterTags(filterTagForm: NgForm) {

    if (filterTagForm.value.tagId != '') {
      let filteredTagList = this.tags.filter(function (tagObj) {
        return tagObj.tagId == filterTagForm.value.tagId;
      });
      this.tagList = new MatTableDataSource(filteredTagList);
      this.noData = this.tagList.connect().pipe(map(data => data.length === 0));
      this.tagList.filterPredicate = this.createFilter();
      this.tagList.sort = this.tagsTableSort;
      this.tagList.paginator = this.tagsPaginator;
      this.firstTableClass = "showData";
      return;
    }
    let loc = this.reverseLoc(filterTagForm.value.location);
    let unit = this.reverseUnit(filterTagForm.value.unit);
    let eqp = this.reverseEqp(filterTagForm.value.equipment);
    this.isLoader = true;
    this.tagMasterService.filteredTagList(loc, unit, eqp, this.useCaseForFilter).subscribe((filteredTagList: any): void => {
      this.isLoader = false;
      this.tagList = new MatTableDataSource(filteredTagList);
      this.tagList.filterPredicate = this.createFilter();
      this.noData = this.tagList.connect().pipe(map(data => data.length === 0));
      this.tagList.sort = this.tagsTableSort;
      this.tagList.paginator = this.tagsPaginator;
      this.firstTableClass = "showData";
    });
  }

  updateDilog(rowdata, action): void {
    rowdata.action = action;
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '800px',
      height: 'auto',
      data: rowdata
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "Success") {
        alert("Updated Successfully");
      }
      this.getLocationList();
      this.getTagTypeList();

    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '800px',
      height: 'auto',
      data: {}

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "Success") {
        alert("Saved Successfully");

      }
      this.getLocationList();
      this.getTagTypeList();
    });
  }

  getLocationName(locationForTagName) {
    if (locationForTagName != null) {
      let loc = this.locationList.filter(function (locObj) {
        if (locObj.locationId == locationForTagName) {
          return locObj.locationName;
        }
      });
      return loc[0].locationName;
    }

  }

  reverseLoc(locName) {
    if (locName != '') {
      let loc = this.locationList.filter(function (locObj) {
        if (locObj.locationName == locName) {
          return locObj.locationId;
        }
      });
      return loc[0].locationId;
    } else {
      return '';
    }
  }

  getUnitName(unt) {
    if (unt != null) {
      let unit = this.unitList.filter(function (unitObj) {
        if (unitObj.unitId == unt) {
          return unitObj.unitName;
        }
      });
      return unit[0].unitName;
    }
  }

  reverseUnit(unt) {
    if (unt != '') {
      let unit = this.unitList.filter(function (unitObj) {
        if (unitObj.unitName == unt) {
          return unitObj.unitId;
        }
      });
      if (unit.length != 0) {
        return unit[0].unitId;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getEquipmentName(eq) {
    if (eq != null) {
      let eqp = this.equipmentList.filter(function (eqObj) {
        if (eqObj.equipmentId == eq) {
          return eqObj.equipmentName;
        }
      });
      return eqp[0].equipmentName;
    }

  }

  reverseEqp(eq) {
    if (eq != '') {
      let eqp = this.equipmentList.filter(function (eqObj) {
        if (eqObj.equipmentName == eq) {
          return eqObj.equipmentId;
        }
      });
      if (eqp.length != 0) {
        return eqp[0].equipmentId;
      } else {
        alert("Equipement is based on Unit");
        this.dataForFilter.equipment = "";
        return '';
      }

    } else {

      return '';
    }

  }

  getTagTypeName(tagTyp) {
    if (tagTyp != null) {
      let tgTp = this.tagTypeList.filter(function (tgTpObj) {
        if (tgTpObj.tagTypeId == tagTyp) {
          return tgTpObj.pointSource;
        }
      });
      return tgTp[0].pointSource;
    }

  }

}



@Component({
  selector: 'modal-component',
  templateUrl: './modal.component.html',
  styleUrls: ['./tagmaster.component.css']
})

export class ModalComponent {
  show: boolean;
  View: boolean = false;
  editDisabled: boolean = false;
  Heading: string = "Create Tag";
  isLoader: boolean = false;
  UseCaseToTags = [];
  locationList;
  unitList;
  equipmentList;
  tagTypeList;
  useCaseList;
  availableTags;
  dropdownSettings = {};
  panelTitle: string;
  tempLoc: string = "-_";
  tempUnit: string = "-";
  tempEquip: string = "_-_";
  tempTagType: string;
  tempTagId = "-";
  loc4Tag: string;
  unitId: any = "";
  locId; eqId; tagTypId; disabledLoc; disabledUnit; disabledEqp; disabledTT; disabledUseCase;
  locationFlag: boolean = false; unitFlag: boolean = false; tagTypeFlag: boolean = false; equipmentFlag: boolean = false;
  isEdit: boolean = false;
  tagDetails;
  mailBody: any;
  errMsg: string;
  errFlag: boolean = false;
  tagAvailable: boolean = false;
  tagExistInPiPointFlag: boolean = false;
  @ViewChild('tagForm') public tagForm: NgForm;
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TagMaster,
    public httpService: HttpService,
    public globals: GlobalService,
    public tagMasterService: TagMasterService,
    public router: Router,
    public _router: ActivatedRoute,
    public piHistoryService: PiHistoryService
  ) { };

  ngOnInit() {

    this.getUseCaseList();
    this.getLocationList();
    this.getTagTypeList();
    this.getUnitList();
    this.getEquipmentList();
    this.getAvailableTags();
    this.checkProperty();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'useCaseId',
      textField: 'useCaseName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 4,
      limitSelection: 4,
      allowSearchFilter: true
    };
  }

  checkProperty() {
    if (this.data.action == "View") {
      this.fetchUseCaseToTags();
      this.Heading = "Tag Details";
      this.isEdit = false;
      this.editDisabled = true;
    }
    if (this.data.action == "update") {
      this.fetchUseCaseToTags();
      this.Heading = "Update Tag";
      this.isEdit = true;
      this.editDisabled = true;
    }
    if (this.data.action == "Create" || this.data.action == undefined) {
      if (this.data.tagId !== undefined) {
        this.checkInputTagId();
      }

      this.Heading = "Create Tag";
      this.isEdit = false;
      this.editDisabled = false;
    }
  }

  checkInputTagId() {
    this.tempTagId = this.data.tagId;
    if (this.tempTagId !== undefined) {
      if (this.tempTagId.lastIndexOf('.') > -1) {
        let lastFullStop = this.tempTagId.lastIndexOf('.');
        this.tempTagId = this.tempTagId.substring(0, lastFullStop) + '_' + this.tempTagId.substring(lastFullStop + 1);
      }
    }
    
    let unit: any = this.data.unitId;
    if (this.tempTagId !== undefined) {
      if (this.tempTagId.startsWith(unit)) {
        this.tempTagId = this.tempTagId.replace(unit + ":", "");
      }
    }
    this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + this.tempTagId;
  }

  getAvailableTags() {
    this.tagMasterService.filteredTagList('', '', '', '').subscribe((tagList: any): void => {
      this.availableTags = tagList;
    });
  }

  fetchUseCaseToTags() {
    this.tagMasterService.getUseCaseByMasterTagId(this.data.id).subscribe(tagDetail => {
      this.data.UseCaseToTags = tagDetail;
    });
  }

  getLocationList() {
    this.tagMasterService.getLocations().subscribe(locData => {
      this.locationList = locData;
      let loc = this.data.locationId;
      if (loc != undefined) {
        let location = this.locationList.filter(function (locObj) {
          return locObj.locationId == loc;
        });
        this.disabledLoc = location[0].locationName;
      }
    });
  }

  getUnitList() {
    this.tagMasterService.getUnits(this.tempLoc).subscribe(unitData => {
      this.unitList = unitData;
      let un = this.data.unitId;
      if (un != undefined) {
        let unit = this.unitList.filter(function (unitObj) {
          return unitObj.unitId == un;
        });
        this.disabledUnit = unit[0].unitName;
      }
    });

  }

  getEquipmentList() {

    this.tagMasterService.getEquipments(this.unitId).subscribe(equipData => {
      this.equipmentList = equipData;
      let eq = this.data.equipmentId;
      if (eq != undefined) {
        let eqp = this.equipmentList.filter(function (eqpObj) {
          return eqpObj.equipmentId == eq;
        });
        this.disabledEqp = eqp[0].equipmentName;
      }
    });

  }

  getUseCaseList() {
    this.tagMasterService.getUseCases().subscribe(useCaseData => {
      this.useCaseList = useCaseData;
    });

  }

  getTagTypeList() {
    this.tagMasterService.getTagTypes().subscribe(tagTypeData => {
      this.tagTypeList = tagTypeData;
      let tt = this.data.tagTypeId;
      if (tt != undefined) {
        let tagtyp = this.tagTypeList.filter(function (ttObj) {
          return ttObj.tagTypeId == tt;
        });
        if (this.data.action == "View" || this.data.action == "update") {
          this.disabledTT = tagtyp[0].pointSource;
        }
      }
    });

  }

  /** Start - Tpeahead on selet events*/
  locationChange(locationForTagName) {
    if (locationForTagName.item.locationName != "") {
      this.locationFlag = false;
      this.tempLoc = locationForTagName.item.locationName + "_";
      this.locId = locationForTagName.item.locationId;
      this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + this.tempTagId;
      this.tagMasterService.getUnits(locationForTagName.item.locationName).subscribe(unitData => {
        this.unitList = unitData;
      });
    } else {
      this.tempLoc = "_-_ ";
      this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + this.tempTagId;
    }
  }

  unitChange(unitForTagName) {
    if (unitForTagName.item.unitName != "") {
      this.unitFlag = false;
      this.tempUnit = unitForTagName.item.unitName;
      this.unitId = unitForTagName.item.unitId;
      this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + this.tempTagId;
      this.tagMasterService.getEquipments(this.unitId).subscribe(equipData => {
        this.equipmentList = equipData;
      });
    } else {
      this.tempUnit = "_-_ ";
      this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + this.tempTagId;
    }
    this.checkInputTagId();
  }

  unitKeyUp(selection) {
    var isUnitAvailable = this.unitList.filter(function (obj) {
      return obj.unitName == selection.value;
    });
    if (isUnitAvailable.length == 0) {
      this.unitFlag = true;
    }
    this.checkInputTagId();
  }

  equipmentChange(equipmentForTagName) {
    if (equipmentForTagName.item.equipmentName != "") {
      this.equipmentFlag = false;
      this.tempEquip = "_" + equipmentForTagName.item.equipmentName + "_";
      this.eqId = equipmentForTagName.item.equipmentId;
      this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + this.tempTagId;
    } else {
      this.tempEquip = "_-_ ";
      this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + this.tempTagId;
    }
  }

  equipmentKeyUp(selection) {
    if (selection.value !== undefined) {
      let isEquipmentAvailable = this.equipmentList.filter(function (obj) {
        return obj.equipmentName == selection.value;
      });
      if (isEquipmentAvailable.length == 0 && selection.value != undefined) {
        this.equipmentFlag = true;
      }
    } else {
      this.equipmentFlag = false;
    }

  }

  tagTypeChange(event) {
    if (event.item.pointSource != "") {
      this.tagTypeFlag = false;
      this.tagTypId = event.item.tagTypeId;
    }
  }

  inputTagId(event: any) {
    let tempTagId;
    if (this.data.tagId != "") {
      tempTagId = this.data.tagId;
    } else {
      tempTagId = event.target.value;
    }
    let lastFullStop = tempTagId.lastIndexOf('.');
    if (lastFullStop > -1) {
      tempTagId = tempTagId.substring(0, lastFullStop) + '_' + tempTagId.substring(lastFullStop + 1);
    }

    let unit: any = this.data.unitId;
    let unitFlag = tempTagId.startsWith(unit);
    if (unitFlag === true) {
      tempTagId = tempTagId.replace(unit + ":", "");
    }

    this.data.r4tagName = this.tempLoc + this.tempUnit + this.tempEquip + tempTagId;
    this.tempTagId = tempTagId;
    this.chkDuplicateTag();
    this.tagExistInPiPoint();
  }

  chkDuplicateTag() {
    let _self = this;
    let isTagAvailable = _self.availableTags.filter(function (obj) {
      return obj.tagId == _self.data.tagId;
    });
    if (isTagAvailable.length != 0) {
      let id = isTagAvailable[0].id;
      _self.tagMasterService.getTagDetails(id).subscribe((result: any): void => {
        _self.tagAvailable = true;
      });
    } else {
      _self.tagAvailable = false;
    }

  }

  tagExistInPiPoint() {
    this.tagMasterService.chktagExistInPiPoint(this.data.tagId).subscribe((result: any): void => {
      if (result.value == "Exists.") {
        this.tagExistInPiPointFlag = false;
      } else {
        this.tagExistInPiPointFlag = true;
      }
    });
  }
  /** Start - Check for wrong input */
  locationKeyUp(selection) {
    var isLocationAvailable = this.locationList.filter(function (obj) {
      return obj.locationName == selection.value;
    });
    if (isLocationAvailable.length == 0) {
      this.locationFlag = true;
    }
  }

  tagTypeKeyUp(selection) {
    var isTagTypeAvailable = this.tagTypeList.filter(function (obj) {
      return obj.pointSource == selection.value;
    });
    if (isTagTypeAvailable.length == 0) {
      this.tagTypeFlag = true;
    }
  }

  /** End - Check for wrong input */

  onDiscardClick(): void {
    this.dialogRef.close();
  }

  onCancelClick(): void {
    this.dialogRef.close("Cancel");
  }

  createSelectedUseCaseList(selectedUseCases) {
    if (selectedUseCases != undefined) {
      const newArray = selectedUseCases.map(o => {
        return { useCaseId: o.useCaseId };
      });

      return newArray;
    }

  }
  
  createTag(tagForm: NgForm) {
    this.data.createdBy = this.globals.loggedInUser;
    this.data.r4location = "test";
    this.data.unitName = "test";
    this.data.equipmentName = "test";
    this.data.modifiedBy = this.globals.loggedInUser;
    this.data.locationId = this.locId;
    this.data.unitId = this.unitId;
    this.data.equipmentId = this.eqId;

    let tagTypeToChk = this.data.tagTypeId;
    if (this.tagTypId == undefined && tagTypeToChk != "") {
      let tagtyp = this.tagTypeList.filter(function (ttObj) {
        return ttObj.pointSource == tagTypeToChk;
      });

      this.data.tagTypeId = tagtyp[0].tagTypeId;

    } else {
      this.data.tagTypeId = this.tagTypId;
    }

    this.data.UseCaseToTags = this.createSelectedUseCaseList(tagForm.value.UseCaseToTags);

    // Fetch useCase names array for PI History request - start
    var useCaseList = this.useCaseList;
    var useCasesNameArr = new Array();
    this.data.UseCaseToTags.forEach(function (obj) {
      useCasesNameArr.push(
        useCaseList.find(x => x.useCaseId == obj.useCaseId).useCaseName
      );
    });
    // Fetch useCase names array for PI History request - end

    let loc = this.getLocationName(this.data.locationId);
    let unit = this.getUnitName(this.data.unitId);

    if (this.data.equipmentId != undefined) {
      let equipment = this.getEquipmentName(this.data.equipmentId);
      this.data.r4tagName = loc[0].locationName + "_" + unit[0].unitName + "_" + equipment[0].equipmentName + "_" + this.tempTagId;
    } else {
      this.data.r4tagName = loc[0].locationName + "_" + unit[0].unitName + "_" + "-" + "_" + this.tempTagId;
    }
    this.tagMasterService.addTag(this.data).subscribe((result: any): void => {
      if (result.value != null && result.value != 0) {
        this.tagMasterService.sendNotification(this.data, this.globals, true);
        this.data.id = result.value;
        this.updateDilog(this.data, "View");
        let sdt = this.convert(new Date());
        let preDate = this.convert(new Date(new Date().setDate(new Date().getDate() - 90)));
        let tagIds: any = [];
        tagIds.push(this.data.tagId);
        let values = {
          "RunBy": this.globals.loggedInUser,
          "Parameters": {
            "StartDate": preDate,
            "EndDate": sdt,
            "TagIds": tagIds,
            "onlyADL": false,
            "useCase": useCasesNameArr
          }
        };

        this.piHistoryService.addRun(values).subscribe((result: any): void => {
          if (String(result.value).startsWith("Success")) {
            confirm("History pipeline has been triggered for last 90 days.");
          }
        });
        this.dialogRef.close(result);
      }
    },
      error => {
        console.log('error', error);
      });

  }

  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  updateTag() {
    this.data.UseCaseToTags = this.createSelectedUseCaseList(this.data.UseCaseToTags);
    this.data.modifiedBy = this.globals.loggedInUser;
    this.tagMasterService.editTag(this.data).subscribe((result: any): void => {
      if (result.value == "Success") {
        this.tagMasterService.sendNotification(this.data, this.globals, false);
        this.dialogRef.close(result);

      }
    });
  }

  getLocationName(locationForTagName) {
    return this.locationList.filter(function (locObj) {
      if (locObj.locationId == locationForTagName) {
        return locObj.locationName;
      }
    });
  }

  getUnitName(unit) {
    return this.unitList.filter(function (unitObj) {
      if (unitObj.unitId == unit) {
        return unitObj.unitName;
      }
    });
  }

  getEquipmentName(eq) {
    return this.equipmentList.filter(function (eqObj) {
      if (eqObj.equipmentId == eq) {
        return eqObj.equipmentName;
      }
    });
  }

  getTagTypeName(tagTypeForTagName) {

    return this.tagTypeList.filter(function (tgTpObj) {
      if (tgTpObj.tagTypeId == tagTypeForTagName) {
        return tgTpObj.pointSource;
      }
    });
  }

  updateDilog(rowdata, action): void {
    this.checkProperty();
    rowdata.action = action;
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '800px',
      height: 'auto',
      data: rowdata
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "Success") {
        alert("Updated Successfully");
      }


    });
  }

  onUseCaseDeSelect(event) {
    alert("Cannot remove already subscribed use cases.");
    this.fetchUseCaseToTags();
  }

}
