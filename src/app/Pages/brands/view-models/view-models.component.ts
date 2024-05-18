import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../Store/app.state';
import { IGetModelPagination } from '../../../Data/Brand/Model/GetModel';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { modelActions } from '../../../Store/Model/model.action';
import { modelSelector } from '../../../Store/Model/model.selector';
import { ConfirmationService, MessageService } from 'primeng/api';

interface IIdsData {
  id: String;
  modelName: string;
}

@Component({
  selector: 'app-view-models',
  templateUrl: './view-models.component.html',
  styleUrl: './view-models.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ViewModelsComponent {
  constructor(
    private _store: Store<IAppState>,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}
  idsData: IIdsData[] = [];
  modelsDataSub!:Subscription;
  modelsData$!: Observable<IGetModelPagination>;
  loading = false;
  verifyMakesResponse$!: Subscription;
  openStatusDialog(event: Event, requestType: string) {
    if (this.idsData.length > 0) {
      this.loading = true;
      const modelNames = this.idsData.map((x) => x.modelName);
      const ids: string[] = this.idsData.map((x) => x.id) as string[];

      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: `Are you sure u want to active the following models ${modelNames}`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon: 'none',
        rejectIcon: 'none',
        rejectButtonStyleClass: 'p-button-text',
        accept: () => {
          this._store.dispatch(modelActions.verifyModels({ ids, requestType }));
          this.verifyMakesResponse$ = this._store
            .select(modelSelector.verifyModelsResponse)
            .subscribe((x) => {
              if (x) {
                this.messageService.add({
                  severity: 'info',
                  summary: 'Confirmed',
                  detail: 'You have accepted',
                });
                this.idsData = [];
                this._store.dispatch(modelActions.getModels());
                this.loading = false;
                this.verifyMakesResponse$.unsubscribe();
              }
            });
        },
        reject: () => {
          this.loading = false;
        },
      });
    }
  }

  handleCheckbox(data: IIdsData) {
    if (!this.idsData.some((item) => item.id === data.id)) {
      this.idsData.push(data);
    } else {
      const index = this.idsData.findIndex((item) => item.id === data.id);
      this.idsData.splice(index, 1);
    }
  }

  checkId(id: string) {
    return this.idsData.some((item) => item.id === id);
  }

  ngOnInit() {
    this._store.dispatch(modelActions.getModels());
    this.modelsData$ = this._store.select(modelSelector.modelsData);
  }

  ngOnDestroy() {
    this.verifyMakesResponse$?.unsubscribe();
  }
}
