import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { modelCategoryActions } from '../../../../../Store/ModelCategory/model.category.action';
import { modelCategorySelector } from '../../../../../Store/ModelCategory/model.category.selector';
import { IAppState } from '../../../../../Store/app.state';

@Component({
  selector: 'app-create-model-categories-form',
  templateUrl: './create-model-categories-form.component.html',
  styleUrl: './create-model-categories-form.component.scss',
})
export class CreateModelCategoriesFormComponent {
  constructor(
    private _builder: FormBuilder,
    private _store: Store<IAppState>
  ) {}
  @Output() onLoading = new EventEmitter<boolean>(false);
  @Input() getModelCategoriesData!: () => void;
  errorText!: string;
  _type = this._builder.control('', Validators.required);
  errorCreateModel = "";
  errorSub = new Subscription();
  createSub = new Subscription();

  handleSubmit() {
    this.onLoading.emit(true);
    if (this._type.valid) {
      this.errorText = "";
      this._store.dispatch(
        modelCategoryActions.createModelCategory({
          values: { type: this._type.getRawValue() as string },
        })
      );
      this.createSub = this._store
        .select(modelCategorySelector.createModelCategorySuccess)
        .subscribe((data) => {
          if (data) {
            this.clearForm();
            this.getModelCategoriesData();
            this.createSub.unsubscribe();
          }
        });

        this.errorSub = this._store.select(modelCategorySelector.createModelCategoryError).subscribe((err)=>{
          if(err){
            console.log(err)
            this.errorCreateModel = err
          }
        })
    } else {
      this.errorText = 'Please type a Category Name';
    }
    this.onLoading.emit(false);
  }

  clearForm() {
    this.errorText = '';
    this.errorCreateModel = ''
    this._type.reset();
  }
}
