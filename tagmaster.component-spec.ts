import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TagmasterComponent, ModalComponent } from './tagmaster.component';
import { GlobalService } from './../services/global.service';
import { TagMasterService } from './../services/tagmaster-service';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { By } from "@angular/platform-browser";
import { Observable, Subject, of } from 'rxjs';
import { TagMaster } from './../models/tagmaster.model';
import { PiHistoryService } from './../services/pihistory-service';
import { HttpService } from './../services/http.service';
import {
  MatToolbarModule, MatIconModule, MatSidenavModule, MatTooltipModule, MatInputModule, MatPaginatorModule,
  MatMenuModule, MatFormFieldModule, MatSelectModule, MatTabsModule, MatListModule, MatTableModule, MatDialogModule,
  MatButtonModule, MatRadioModule, MatAutocompleteModule, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatSort
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//-------------- TagMasterComponent Test cases : Start --------------------//
describe('TagmasterComponent', () => {
  let component: TagmasterComponent;
  let fixture: ComponentFixture<TagmasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagmasterComponent],
      imports: [RouterModule.forRoot([]), RouterTestingModule,
        HttpClientModule, FormsModule, ReactiveFormsModule, MatSortModule, NgbModule, NgMultiSelectDropDownModule.forRoot(), TypeaheadModule.forRoot(), MatToolbarModule, MatIconModule, MatSidenavModule, MatTooltipModule, MatInputModule, MatPaginatorModule,
        MatMenuModule, MatFormFieldModule, MatSelectModule, MatTabsModule, MatListModule, MatTableModule, MatDialogModule,
        MatButtonModule, MatRadioModule, MatAutocompleteModule, BrowserAnimationsModule],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' }, GlobalService,
        { provide: TagMasterService, useClass: TagMasterServiceMock },
        { provide: HttpService, useClass: HttpServiceMock }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagmasterComponent);
    component = fixture.componentInstance;
	  fixture.detectChanges();
	  component.unitList = [{ "unitId": 1, "unitName": "unit1000", "locationId": 1, "equipment": [] }, { "unitId": 2, "unitName": "unit2000", "locationId": 1, "equipment": [] }];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return locFocusOut', () => {
    spyOn(component, 'locFocusOut').and.callThrough();
	  component.locFocusOut("");
	  component.locFocusOut({value:"loc"});
    expect(component.locFocusOut).toHaveBeenCalled();
  });

  it('Validate use case should trigger', () => {
    spyOn(component, 'validateUseCase').and.callThrough();
    component.validateUseCase({ item: { value: 1 } });
    component.validateUseCase({ item: { value: "" } });
    expect(component.validateUseCase).toHaveBeenCalled();
  });

  it('should unit list populate on selected location', () => {
    spyOn(component, 'getUnitList').and.callThrough();
    component.getUnitList({ item: { locationId: 1 } });
    component.getUnitList({ item: { locationId: "" } });
    expect(component.getUnitList).toHaveBeenCalled();
  });

  it('should unit code populate for selected unit', () => {
    spyOn(component, 'getUnitCode').and.callThrough();
    component.getUnitCode({ item: { unitId: 1 } });
    component.getUnitCode({ item: {} });
    expect(component.getUnitCode).toHaveBeenCalled();
  });

  it('should equipment code populate for selected equipment', () => {
    spyOn(component, 'getEquipmentCode').and.callThrough();
    component.getEquipmentCode({ item: { equipmentId: 1 } });
    component.getEquipmentCode({ item: {} });
    expect(component.getEquipmentCode).toHaveBeenCalled();
  });

  it('should location name fetch for tagname', () => {
    spyOn(component, 'getLocationName').and.callThrough();
    component.getLocationName(1);
    expect(component.getLocationName).toHaveBeenCalled();
  });

  it('should location be reversed', () => {
    spyOn(component, 'reverseLoc').and.callThrough();
    component.reverseLoc("");
    component.reverseLoc("loc");
    expect(component.reverseLoc).toHaveBeenCalled();
  });

  it('should unit name fetch for unit', () => {
    spyOn(component, 'getUnitName').and.callThrough();
    component.getUnitName(1);
    expect(component.getUnitName).toHaveBeenCalled();
  });

  it('should unit be reversed', () => {
    spyOn(component, 'reverseUnit').and.callThrough();
    component.reverseUnit("");
    component.reverseUnit("unit1000");
    component.reverseUnit("invalidUnitName");
    expect(component.reverseUnit).toHaveBeenCalled();
  });

  it('should equipment name fetch for equipment', () => {
    spyOn(component, 'getEquipmentName').and.callThrough();
    component.getEquipmentName(1);
    expect(component.getEquipmentName).toHaveBeenCalled();
  });

  it('should equipment be reversed', () => {
    spyOn(component, 'reverseEqp').and.callThrough();
    component.reverseEqp("");
    component.reverseEqp("equip1000");
    component.reverseEqp("invalidEquipName");
    expect(component.reverseEqp).toHaveBeenCalled();
  });

  it('should tagtype name fetch for tagtype', () => {
    spyOn(component, 'getTagTypeName').and.callThrough();
    component.getTagTypeName(1);
    expect(component.getTagTypeName).toHaveBeenCalled();
  });

  it('should process Filter tag event', () => {
    const testForm = <NgForm>{
		value: {
        tagId: "1",
        location: "loc0",
        unit: "unit1000",
        equipment: "equip1000"
      }
    };

    spyOn(component, 'filterTags').and.callThrough();
	  component.filterTags(testForm);
      
    component.locCode = 1;
    component.filterTags(testForm);

    testForm.value.location = "loc";
	  component.filterTags(testForm);

	  testForm.value.tagId = '';
	  component.filterTags(testForm);

    expect(component.filterTags).toHaveBeenCalled();
  });

	it('should preocess resetFilter', () => {
		spyOn(component, 'resetFilter').and.callThrough();
		component.resetFilter();
		expect(component.resetFilter).toHaveBeenCalled();
	});


  it('should return filtered tags on unit', () => {
	  spyOn(component, 'unitFocusOut').and.callThrough();
	  component.unitFocusOut({ value: "" });
	  component.unitFocusOut({ value: "unit1000" });
	  component.unitFocusOut({ value: "invalidUnitName" });
    expect(component.unitFocusOut).toHaveBeenCalled();
  });

  it('should return filtered tags on equipment', () => {
	  spyOn(component, 'equipmentFocusOut').and.callThrough();
	  component.unitCode = 1;
	  component.equipmentList = [{ "equipmentId": 1, "equipmentName": "equip1000", "unitId": 1, "equipmentDesc": "" }, { "equipmentId": 2, "equipmentName": "Equip2000", "unitId": 1, "equipmentDesc": "" }];
	  component.equipmentFocusOut({ value: "" });
	  component.equipmentFocusOut({ value: "equip1000" });
	  component.reverseEqp("equip1000");
    component.reverseEqp("invalidEquipmentName");
    expect(component.equipmentFocusOut).toHaveBeenCalled();
  });

  it('should Process Check Tag Id', () => {
    spyOn(component, 'chkTagIds').and.callThrough();
    component.chkTagIds("");
    component.tagIdsToExport.push("testId");
    component.chkTagIds("testId");
    expect(component.chkTagIds).toHaveBeenCalled();
  });

  it('should process Export Tag event', () => {
    spyOn(component, 'moveTagAcrossPlatform').and.callThrough();
    component.moveTagAcrossPlatform();
    expect(component.moveTagAcrossPlatform).toHaveBeenCalled();
  });

	it('should process checkUseCase event', () => {
		spyOn(component, 'checkUseCase').and.callThrough();
		component.useCaseList = [{ "useCaseId": 1, "useCaseName": "testname" }];
		component.checkUseCase({ value: "" });
		component.checkUseCase({ value: "testname" });
		expect(component.checkUseCase).toHaveBeenCalled();
	});


	afterAll(() => {
		TestBed.resetTestingModule();
	});
});

describe('TagmasterComponent', () => {
	let component: TagmasterComponent;
	let fixture: ComponentFixture<TagmasterComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TagmasterComponent],
			imports: [RouterModule.forRoot([]), RouterTestingModule,
				HttpClientModule, FormsModule, ReactiveFormsModule, MatSortModule, NgbModule, NgMultiSelectDropDownModule.forRoot(), TypeaheadModule.forRoot(), MatToolbarModule, MatIconModule, MatSidenavModule, MatTooltipModule, MatInputModule, MatPaginatorModule,
				MatMenuModule, MatFormFieldModule, MatSelectModule, MatTabsModule, MatListModule, MatTableModule, MatDialogModule,
				MatButtonModule, MatRadioModule, MatAutocompleteModule, BrowserAnimationsModule],
			providers: [
				{ provide: APP_BASE_HREF, useValue: '/' }, GlobalService,
				{ provide: TagMasterService, useClass: TagMasterServiceNegativeMock },
				{ provide: HttpService, useClass: HttpServiceMock }
			],
			schemas: [
				CUSTOM_ELEMENTS_SCHEMA,
				NO_ERRORS_SCHEMA
			],
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TagmasterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		component.unitList = [{ "unitId": 1, "unitName": "unit1000", "locationId": 1, "equipment": [] }, { "unitId": 2, "unitName": "unit2000", "locationId": 1, "equipment": [] }];
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should process Export Tag event', () => {
		spyOn(component, 'moveTagAcrossPlatform').and.callThrough();
		component.moveTagAcrossPlatform();
		expect(component.moveTagAcrossPlatform).toHaveBeenCalled();
	});

	afterAll(() => {
		TestBed.resetTestingModule();
	});
});

//-------------- TagMasterComponent Test cases : End --------------------//
//-------------- ModalComponent Test cases : Start --------------------//

describe('ModalComponent', () => {

  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let dialog: MatDialogModule;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalComponent],
      imports: [RouterModule.forRoot([]), RouterTestingModule,
        HttpClientModule, FormsModule, ReactiveFormsModule, MatSortModule, NgbModule, NgMultiSelectDropDownModule.forRoot(), TypeaheadModule.forRoot(), MatToolbarModule, MatIconModule, MatSidenavModule, MatTooltipModule, MatInputModule, MatPaginatorModule,
        MatMenuModule, MatFormFieldModule, MatSelectModule, MatTabsModule, MatListModule, MatTableModule, MatDialogModule,
        MatButtonModule, MatRadioModule, MatAutocompleteModule, BrowserAnimationsModule],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        {
          provide: MatDialogRef,
          useValue: {
            close: (dialogResult: any) => { }
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
			  { provide: TagMasterService, useClass: TagMasterServiceMock },
        { provide: PiHistoryService, useClass: PiHistoryServiceMock },
        { provide: HttpService, useClass: HttpServiceMock }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ],
    })

    dialog = TestBed.get(MatDialogModule);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    component.data = {
      id: 0, r4tagName: "", tagId: "", locationId: 1, unitId: 1, equipmentId: 1, typeOfMeasure: "", engunits: "", tagDesc: "",
      processName: "", lowerBound: "", upperBound: "", createdBy: "", createdTime: new Date, modifiedBy: "",
      modifiedTime: new Date, tagTypeId: 1, r4location: "", locationName: "", unitName: "", equipmentName: "",
      action: "View",  UseCaseToTags: []
    }
    component.locId = 1;
    component.unitId = 1;
    component.tagTypId = 1;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onUseCaseDeSelect', () => {
    spyOn(component, 'onUseCaseDeSelect').and.callThrough();
    component.onUseCaseDeSelect({ item: { useCaseName: "test" } });
    expect(component.onUseCaseDeSelect).toHaveBeenCalled();
  });

  it('should initialize for edit', () => {
    component.data.action = "Edit";
    spyOn(component, 'ngOnInit').and.callThrough();
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  it('should process checkProperty event', () => {
    spyOn(component, 'checkProperty').and.callThrough();
    component.data.action = "update";
    component.checkProperty();

    component.data.action = "Create";
    component.checkProperty();
    expect(component.checkProperty).toHaveBeenCalled();
  });

  it('should process checkInputTagId event', () => {
    spyOn(component, 'checkInputTagId').and.callThrough();
    component.data.tagId = "1:test.test";
    component.checkInputTagId();
    expect(component.checkInputTagId).toHaveBeenCalled();
  });

  it('should process location change event', () => {
    spyOn(component, 'locationChange').and.callThrough();
    component.locationChange({ item: { locationName: "loc" } });
    component.locationChange({ item: { locationName: "" } });
    expect(component.locationChange).toHaveBeenCalled();
  });

  it('should process unit change event', () => {
    spyOn(component, 'unitChange').and.callThrough();
    component.unitChange({ item: { unitName: "unit1000" } });
    component.unitChange({ item: { unitName: "" } });
    expect(component.unitChange).toHaveBeenCalled();
  });

  it('should process equipment change event', () => {
    spyOn(component, 'equipmentChange').and.callThrough();
    component.equipmentChange({ item: { equipmentName: "equip1000" } });
    component.equipmentChange({ item: { equipmentName: "" } });
    expect(component.equipmentChange).toHaveBeenCalled();
  });

  it('should process tagType change event', () => {
    spyOn(component, 'tagTypeChange').and.callThrough();
    component.tagTypeChange({ item: { pointSource: "source123" } });
    expect(component.tagTypeChange).toHaveBeenCalled();
  });

  it('should process inputTagId event', () => {
    spyOn(component, 'inputTagId').and.callThrough();
    component.inputTagId({ target: { value: "tagId1" } });
    component.data.tagId = "1.test.test";
    component.inputTagId({ target: { value: "tagId1" } });
    expect(component.inputTagId).toHaveBeenCalled();
  });

  it('should check input on location keyUp', () => {
    //console.log("component.locationList = " + JSON.stringify(component.locationList));
    spyOn(component, 'locationKeyUp').and.callThrough();
    component.locationKeyUp({ value: "loc" });
    component.locationKeyUp({ value: "loc0" });
    expect(component.locationKeyUp).toHaveBeenCalled();
  });

  it('should check input on unit keyUp', () => {
    spyOn(component, 'unitKeyUp').and.callThrough();
    component.unitKeyUp({ value: "unit1000" });
    component.unitKeyUp({ value: "unit10000" });
    expect(component.unitKeyUp).toHaveBeenCalled();
  });

  it('should check input on equipment keyUp', () => {
    spyOn(component, 'equipmentKeyUp').and.callThrough();
    component.equipmentKeyUp({});
    component.equipmentKeyUp({ value: "equip1000" });
    component.equipmentKeyUp({ value: "equip10000" });
    expect(component.equipmentKeyUp).toHaveBeenCalled();
  });

  it('should check input on tagType keyUp', () => {
    spyOn(component, 'tagTypeKeyUp').and.callThrough();
    component.tagTypeKeyUp({ value: "source123" });
    component.tagTypeKeyUp({ value: "source123123" });
    expect(component.tagTypeKeyUp).toHaveBeenCalled();
  });

  it('should close dialogue on cancel click', () => {
    spyOn(component, 'onCancelClick').and.callThrough();
    component.onCancelClick();
    expect(component.onCancelClick).toHaveBeenCalled();
  });

	it('should tagtype name fetch for tagtype', () => {
		spyOn(component, 'getTagTypeName').and.callThrough();
		component.getTagTypeName(1);
		expect(component.getTagTypeName).toHaveBeenCalled();
	});

	it('should process update tag event', () => {
		spyOn(component, 'updateTag').and.callThrough();
		component.data.id = 1;
		component.updateTag();
		expect(component.updateTag).toHaveBeenCalled();
	});

  it('should process create tag event', () => {
    const testForm = <NgForm>{
      value: {
        name: "",
			  category: "",
			  UseCaseToTags: [{ useCaseId: 1 }]
      }
	  };
	  spyOn(component, 'updateDilog').and.callFake(function () { });
    spyOn(component, 'createTag').and.callThrough();
    component.createTag(testForm);

    component.eqId = 1;
    component.createTag(testForm);
    expect(component.createTag).toHaveBeenCalled();
  });

  it('should close dialogue on discard click', () => {
    spyOn(component, 'onDiscardClick').and.callThrough();
    component.onDiscardClick();
    expect(component.onDiscardClick).toHaveBeenCalled();
  });

  it('should return getAvailableTags', () => {
    spyOn(component, 'getAvailableTags').and.callThrough();
    component.getAvailableTags();
    expect(component.getAvailableTags).toHaveBeenCalled();
  });

  it('check if tag exist in pi point', () => {
    spyOn(component, 'tagExistInPiPoint').and.callThrough();
    component.tagExistInPiPoint();
    expect(component.tagExistInPiPoint).toHaveBeenCalled();
  });

  it('check if tag is duplicate', () => {
    spyOn(component, 'chkDuplicateTag').and.callThrough();
    component.chkDuplicateTag();
    component.data.tagId = "1";
    component.chkDuplicateTag();
    expect(component.chkDuplicateTag).toHaveBeenCalled();
  });

	afterAll(() => {
		TestBed.resetTestingModule();
	});

});
//-------------- ModalComponent Test cases : Start --------------------//
describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let dialog: MatDialogModule;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalComponent],
      imports: [RouterModule.forRoot([]), RouterTestingModule,
        HttpClientModule, FormsModule, ReactiveFormsModule, MatSortModule, NgbModule, NgMultiSelectDropDownModule.forRoot(), TypeaheadModule.forRoot(), MatToolbarModule, MatIconModule, MatSidenavModule, MatTooltipModule, MatInputModule, MatPaginatorModule,
        MatMenuModule, MatFormFieldModule, MatSelectModule, MatTabsModule, MatListModule, MatTableModule, MatDialogModule,
        MatButtonModule, MatRadioModule, MatAutocompleteModule, BrowserAnimationsModule],
      providers: [{
        provide: MatDialogRef,
        useValue: {
          close: (dialogResult: any) => { }
        }
      },
      { provide: MAT_DIALOG_DATA, useValue: {} },
			{ provide: TagMasterService, useClass: TagMasterServiceNegativeMock },
			{ provide: PiHistoryService, useClass: PiHistoryServiceMock }],
    })

    dialog = TestBed.get(MatDialogModule);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
	  component.data = {
		  id: 0, r4tagName: "", tagId: "", locationId: 1, unitId: 1, equipmentId: 1, typeOfMeasure: "", engunits: "", tagDesc: "",
      processName: "", lowerBound: "", upperBound: "", createdBy: "", createdTime: new Date, modifiedBy: "",
      modifiedTime: new Date, tagTypeId: 1, r4location: "", locationName: "", unitName: "", equipmentName: "",
      action: "View", UseCaseToTags: []
    }
    component.locId = 1;
    component.unitId = 1;
    component.tagTypId = 1;

    fixture.detectChanges();
  });

  it('should process create tag event', () => {
    const testForm = <NgForm>{
      value: {
        name: "",
        category: "",
			  UseCaseToTags: [{ useCaseId: 1 }]
      }
	  };
	  spyOn(component, 'updateDilog').and.callFake(function () { });
    spyOn(component, 'createTag').and.callThrough();
    component.createTag(testForm);

    component.eqId = 1;
    component.createTag(testForm);
    expect(component.createTag).toHaveBeenCalled();
  });

  it('check if tag exist in pi point', () => {
    spyOn(component, 'tagExistInPiPoint').and.callThrough();
    component.tagExistInPiPoint();
    expect(component.tagExistInPiPoint).toHaveBeenCalled();
  });

	afterAll(() => {
		TestBed.resetTestingModule();
	});
});
//-------------- ModalComponent Test cases : End --------------------//

//-------------- TagMaster service mock class : Start --------------------//

class TagMasterServiceMock {

  getLocations() {

    const mockLocData: Observable<any[]> =
      of([{ "locationId": 1, "locationName": "loc", "locationDesc": "For testing purpose", "unit": [] }]);

    return mockLocData;
  }

  getTagTypes() {
    const mockTagTypeData: Observable<any[]> =
      of([{ "tagTypeId": 1, "pointSource": "source123", "pointType": "R", "pointTypex": "float32", "locationId": 1, "descriptor": null }]);

    return mockTagTypeData;
  }

  getUnits(selectedLoc) {
    const mockUnits: Observable<any[]> =
      of([{ "unitId": 1, "unitName": "unit1000", "locationId": 1, "equipment": [] }, { "unitId": 2, "unitName": "unit2000", "locationId": 1, "equipment": [] }]);

    return mockUnits;
  }

  getEquipments(selectedUnit) {
    const mockEquipData: Observable<any[]> =
      of([{ "equipmentId": 1, "equipmentName": "equip1000", "unitId": 1, "equipmentDesc": "" }, { "equipmentId": 2, "equipmentName": "Equip2000", "unitId": 1, "equipmentDesc": "" }]);

    return mockEquipData;
  }

  filteredTagList(loc, unit, eq) {
    const mockTagListData: Observable<any[]> =
      of([{
		    "id": "", "r4tagName": "", "tagId": "1", "locationId": "1", "unitId": "1", "equipmentId": "1", "typeOfMeasure": "", "engunits": "", "tagDesc": "",
        "processName": "", "lowerBound": "", "upperBound": "", "createdBy": "", "createdTime": "", "modifiedBy": "",
        "modifiedTime": "", "tagTypeId": "1", "r4location": "", "locationName": "", "unitName": "", "equipmentName": "",
        "action": "View", "UseCaseToTags": []
      }]);

    return mockTagListData;
  }

  addTag(tagMasterData) {
    const mockResultData: Observable<any> =
      of({ "contentType": null, "serializerSettings": null, "statusCode": null, "value": 123 });

    return mockResultData;
  }

  editTag(tagMasterData) {
    const mockResultData: Observable<any> =
      of({ "contentType": null, "serializerSettings": null, "statusCode": null, "value": "Success" });

    return mockResultData;
  }

  tagsMovement(tagMasterData) {
    const mockResultData: Observable<any> =
      of({ "contentType": null, "serializerSettings": null, "statusCode": null, "value": "Success" });

    return mockResultData;
  }

  getTagDetails(tagId) {
    const mockTagData: Observable<any> =
      of({
		    "id": "", "r4tagName": "", "tagId": "1", "locationId": "1", "unitId": "1", "equipmentId": "1", "typeOfMeasure": "", "engunits": "", "tagDesc": "",
        "processName": "", "lowerBound": "", "upperBound": "", "createdBy": "", "createdTime": "", "modifiedBy": "",
        "modifiedTime": "", "tagTypeId": "1", "r4location": "", "locationName": "", "unitName": "", "equipmentName": "",
        "action": "View", "UseCaseToTags": []
      });

    return mockTagData;
  }

  getUseCases() {
    const mockEquipData: Observable<any[]> =
      of([{ "useCaseId": 1, "useCaseName": "testname" }]);

    return mockEquipData;
  }

  getUseCaseByMasterTagId(tagId) {
    const mockEquipData: Observable<any[]> =
      of([{ "useCaseId": 1, "useCaseName": "testname" } ]);

    return mockEquipData;
  }

  chktagExistInPiPoint(tagId) {
    const mockEquipData: Observable<any[]> =
      of([{ "value": "Exists.", "formatters": [], "contentTypes": [], "declaredType": null, "statusCode": 111 }]);

    return mockEquipData;
  }


  sendNotification(data, globals, isNew) {
  }
}

class TagMasterServiceNegativeMock {

  getLocations() {

    const mockLocData: Observable<any[]> =
      of([{ "locationId": 1, "locationName": "loc", "locationDesc": "For testing purpose", "unit": [] }]);

    return mockLocData;
  }

  getTagTypes() {
    const mockTagTypeData: Observable<any[]> =
      of([{ "tagTypeId": 1, "pointSource": "source123", "pointType": "R", "pointTypex": "float32", "locationId": 1, "descriptor": null }]);

    return mockTagTypeData;
  }

  getUnits(selectedLoc) {
    const mockUnits: Observable<any[]> =
      of([{ "unitId": 1, "unitName": "unit1000", "locationId": 1, "equipment": [] }, { "unitId": 2, "unitName": "unit2000", "locationId": 1, "equipment": [] }]);

    return mockUnits;
	}

	tagsMovement(tagMasterData) {
		const mockResultData: Observable<any> =
			of({ "contentType": null, "serializerSettings": null, "statusCode": null, "value": "Failed" });

		return mockResultData;
	}

  getEquipments(selectedUnit) {
    const mockEquipData: Observable<any[]> =
      of([{ "equipmentId": 1, "equipmentName": "equip1000", "unitId": 1, "equipmentDesc": "" }, { "equipmentId": 2, "equipmentName": "Equip2000", "unitId": 1, "equipmentDesc": "" }]);

    return mockEquipData;
  }

  addTag(tagMasterData) {
    const mockResultData: Observable<any> =
      of({ "contentType": null, "serializerSettings": null, "statusCode": null, "value": 0 });

    return mockResultData;
  }

  getTagDetails(tagId) {
    const mockTagData: Observable<any> =
      of(null);

    return mockTagData;
  }

  getUseCases() {
    const mockEquipData: Observable<any[]> =
      of([{ "useCaseId": 1, "useCaseName": "testname" }]);

    return mockEquipData;
  }

  getUseCaseByMasterTagId(tagId) {
    const mockEquipData: Observable<any[]> =
      of([{ "useCaseId": 1, "useCaseName": "test" }]);

    return mockEquipData;
  }

  chktagExistInPiPoint(tagId) {
    const mockEquipData: Observable<any[]> =
      of([{ "value": "test", "formatters": [], "contentTypes": [], "declaredType": null, "statusCode": 111 }]);

    return mockEquipData;
  }

  filteredTagList(loc, unit, eq) {
    const mockTagListData: Observable<any[]> =
      of([{
        "id": "", "r4tagName": "", "tagId": "", "locationId": "1", "unitId": "1", "equipmentId": "1", "typeOfMeasure": "", "engunits": "", "tagDesc": "",
        "processName": "", "lowerBound": "", "upperBound": "", "createdBy": "", "createdTime": "", "modifiedBy": "",
        "modifiedTime": "", "tagTypeId": "1", "r4location": "", "locationName": "", "unitName": "", "equipmentName": "",
        "action": "View", "UseCaseToTags": []
      }]);

    return mockTagListData;
  }
  sendNotification(data, globals, isNew) {
  }
}
//-------------- TagMaster service mock class : End --------------------//

//-------------- PiHistoryService mock class : Start --------------------//

class PiHistoryServiceMock {
	addRun(RunData) {
		const mockResultData: Observable<any> =
			of({ "contentType": null, "serializerSettings": null, "statusCode": null, "value": "Success:RunId" });

		return mockResultData;
	}
}
//-------------- PiHistoryService mock class : End --------------------//


//-------------- HttpService mock class : Start --------------------//
class HttpServiceMock {
  get(a, b) {
    const res: Observable<any> =
      of({
        "Currency": [
          "EUR",
          "USD"
        ]
      });
    return res;
  }
}

//-------------- HttpService mock class : End --------------------//
