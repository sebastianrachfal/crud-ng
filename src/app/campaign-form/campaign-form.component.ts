import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CampaignValues } from '../../models/Campaign';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent {
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordControl = new FormControl('', [Validators.maxLength(15)]);
  statusControl: FormControl;
  filteredKeywords?: Observable<string[]>;
  nameControl: FormControl;
  bidControl: FormControl;
  townControl: FormControl;
  fundControl: FormControl;
  radiusControl: FormControl;
  fundMatcher: FundMatcher;
  bidMatcher: BidMatcher;
  keywordError: boolean = false;
  keywords: string[] = ['Campaign'];
  predefinedKeywords: string[] = [
    'Clothing',
    'Food',
    'Commerce',
    'Woodworking',
    'Ongoing',
    'One-time',
    'Offshore',
  ];
  predefinedTowns: string[] = [
    'Los Angeles',
    'New York City',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
  ];
  @ViewChild('keywordInput') keywordInput:
    | ElementRef<HTMLInputElement>
    | undefined;

  @ViewChild('auto') matAutocomplete: MatAutocomplete | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CampaignValues,
    public dialogRef: MatDialogRef<CampaignFormComponent>
  ) {
    this.keywords = data.keywords?.slice(0, data.keywords.length) || [];

    // TODO: maybe wrap it in it's own object for simplicity
    this.nameControl = new FormControl(data.name || '', [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.bidControl = new FormControl(data.bidAmount || undefined, [
      Validators.required,
      Validators.min(0),
      Validators.max(Number.MAX_SAFE_INTEGER),
    ]);
    this.fundControl = new FormControl(data.fund || undefined, [
      Validators.required,
      Validators.min(0),
      Validators.max(Number.MAX_SAFE_INTEGER),
    ]);
    this.statusControl = new FormControl(
      data.status ? 'On' : 'Off' || undefined,
      [Validators.required]
    );
    this.townControl = new FormControl(data.town || undefined, [
      Validators.required,
    ]);
    this.radiusControl = new FormControl(data.radius || undefined, [
      Validators.required,
      Validators.min(0),
      Validators.max(500000),
    ]);
    //? -------------------------------------------------------------

    this.predefinedKeywords = this.predefinedKeywords.filter(
      (e) => !data.keywords?.includes(e)
    );
    this.applyPipe();

    this.fundMatcher = new FundMatcher((data.balance || 0) + (data.fund || 0));
    this.bidMatcher = new BidMatcher(this.fundControl);
  }

  //? Form buttons
  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmitClick(): void {
    if (this.checkValidation())
      this.dialogRef.close({
        name: this.nameControl.value,
        keywords: this.keywords,
        bidAmount: this.bidControl.value,
        fund: this.fundControl.value,
        status: this.statusControl.value == 'On',
        radius: this.radiusControl.value,
        town: this.townControl.value,
      });
  }

  //? Keyword handling
  add(event: MatChipInputEvent): void {
    const input = event.input;
    let value = (event.value || '').trim();
    value = value[0].toUpperCase() + value.substr(1);
    value = value.substr(0, 15);
    if (value && this.keywords.indexOf(value) == -1) {
      this.predefinedKeywords.slice(this.predefinedKeywords.indexOf(value), 1);
      this.keywords.push(value);
      this.keywordError = false;
    }
    if (input) input.value = '';
    this.keywordControl.setValue(null);
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    this.keywords.push(event.option.viewValue);
    this.predefinedKeywords = this.predefinedKeywords.filter(
      (e) => e != event.option.viewValue
    );
    this.keywordInput?.nativeElement.blur();
    this.keywordError = false;
    if (this.keywordInput) this.keywordInput.nativeElement.value = '';
    this.keywordControl.setValue(null);
    this.applyPipe();
  }
  remove(keyword: string): void {
    const index = this.keywords.indexOf(keyword);
    this.predefinedKeywords = [...this.predefinedKeywords, keyword];
    this.keywordControl.updateValueAndValidity({
      onlySelf: true,
      emitEvent: true,
    });
    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
    this.applyPipe();
  }
  private applyPipe(): void {
    this.filteredKeywords = this.keywordControl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) =>
        keyword ? this._filter(keyword) : this.predefinedKeywords.slice()
      )
    );
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.predefinedKeywords.filter((keyword) =>
      keyword.toLowerCase().includes(filterValue)
    );
  }

  //? Additional dynamic form validation, mainly for checking against balance
  private checkValidation(): boolean {
    let ret = true;
    for (let control of [
      this.nameControl,
      this.statusControl,
      this.bidControl,
      this.fundControl,
      this.townControl,
      this.radiusControl,
    ]) {
      control.markAsTouched();
      if (control.errors) ret = false;
    }

    if ((this.keywordError = this.keywords.length == 0)) {
      ret = false;
    }
    return ret;
  }
}

//? Matchers generating errors for bid and fund checks
export class FundMatcher implements ErrorStateMatcher {
  maxAmm: number;
  constructor(max: number) {
    this.maxAmm = max;
  }
  isErrorState(control: FormControl | null): boolean {
    return (
      (control?.touched && control?.value == undefined) ||
      this.maxAmm < control?.value ||
      control?.value < 0
    );
  }
}
export class BidMatcher implements ErrorStateMatcher {
  fundControl: FormControl;
  constructor(fund: FormControl) {
    this.fundControl = fund;
  }
  isErrorState(control: FormControl | null): boolean {
    return (
      (control?.touched && control?.value == undefined) ||
      this.fundControl.value < control?.value ||
      control?.value < 0
    );
  }
}
