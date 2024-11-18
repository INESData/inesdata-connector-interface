import { Component, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransferProcessStates } from "../../../shared/models/transfer-process-states";
import { NegotiationResult } from "../../../shared/models/negotiation-result";
import { ContractNegotiation, ContractNegotiationRequest, Policy } from "../../../shared/models/edc-connector-entities";
import { CatalogBrowserService } from 'src/app/shared/services/catalog-browser.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { StorageType } from 'src/app/shared/models/storage-type';
import { PolicyCard } from '../../../shared/models/policy/policy-card';
import { DATA_ADDRESS_TYPES } from '../../../shared/utils/app.constants';
import { PolicyCardBuilder } from 'src/app/shared/models/policy/policy-card-builder';
import { JsonDialogData } from '../../json-dialog/json-dialog/json-dialog.data';
import { JsonDialogComponent } from '../../json-dialog/json-dialog/json-dialog.component'
import { PolicyBuilder } from '@think-it-labs/edc-connector-client';
import { Router } from '@angular/router';

export interface ContractOffersDialogData {
  assetId: string;
  contractOffers?: any;
  endpointUrl?: string;
  properties: any;
  privateProperties: any;
  dataAddress?: any;
  isCatalogView: boolean;
  returnUrl?: string;
}

interface RunningTransferProcess {
  processId: string;
  assetId?: string;
  state: TransferProcessStates;
}

interface Offer {
  policyCard: PolicyCard,
  policy: Policy;
}

@Component({
  selector: 'contract-offers-viewer',
  templateUrl: './contract-offers-viewer.component.html',
  styleUrls: ['./contract-offers-viewer.component.scss']
})
export class ContractOffersViewerComponent {

  runningTransferProcesses: RunningTransferProcess[] = [];
  runningNegotiations: Map<string, NegotiationResult> = new Map<string, NegotiationResult>();
  finishedNegotiations: Map<string, ContractNegotiation> = new Map<string, ContractNegotiation>();
  assetDataKeys: string[];
  assetDataEntries: { [key: string]: any[] } = {};
  dataAddressType: string;
  policyCards: PolicyCard[] = [];
  offers: Offer[] = [];
  data: ContractOffersDialogData= undefined;
  private pollingHandleNegotiation?: any;

  constructor(@Inject('STORAGE_TYPES') public storageTypes: StorageType[],
    private apiService: CatalogBrowserService, private notificationService: NotificationService,
    private policyCardBuilder: PolicyCardBuilder,
    private readonly dialog: MatDialog,
    private router: Router) {
    this.data =undefined
    this.data = this.router.getCurrentNavigation()?.extras.state.assetDetailData;
    if(!this.data){
      this.router.navigate(['/'])
    }
    this.assetDataKeys = Object.keys(this.data.properties.assetData);
    this.processAssetData();
    if(this.data.contractOffers){
      this.processPolicies();
    }

    if(this.data.dataAddress) {
      if(this.data.privateProperties) {
        this.dataAddressType = DATA_ADDRESS_TYPES.inesDataStore;
      } else {
        this.dataAddressType = this.getDataAddressName(this.data.dataAddress.type);
        delete this.data.dataAddress['@type'];
      }
    }

  }
  processPolicies() {
    if(this.isArray(this.data.contractOffers)) {
      for (const contractOffer of this.data.contractOffers) {
        const parsedComplexPolicy = this.convertExpressionsToArray(contractOffer.complexPolicy);
        this.offers.push({
          policyCard: this.policyCardBuilder.buildPolicyCardFromContractOffer(parsedComplexPolicy),
          policy: new PolicyBuilder()
              .raw({
                ...contractOffer.offer,
                target: this.data.assetId,
                assigner: this.data.properties.participantId
              })
              .build()
        })
      }
    } else {
      const parsedComplexPolicy = this.convertExpressionsToArray(this.data.contractOffers.complexPolicy);
      this.offers.push({
        policyCard: this.policyCardBuilder.buildPolicyCardFromContractOffer(parsedComplexPolicy),
        policy: new PolicyBuilder()
            .raw({
              ...this.data.contractOffers.offer,
              target: this.data.assetId,
              assigner: this.data.properties.participantId
            })
            .build()
      })
    }

  }

  getDataAddressName(dataAddressTypeId: string) {
    const foundObject = this.storageTypes.find(item => item.id === dataAddressTypeId);
    return foundObject ? foundObject.name : null;
}

  processAssetData() {
    this.assetDataKeys = this.assetDataKeys.filter(key => {
      const entries = this.getEntries(this.data.properties.assetData[key]);

      if (entries.length === 0) {
        return false;
      }

      this.assetDataEntries[key] = entries.map(item => ({
        key: item.key,
        value: item.value,
        isObject: this.isObject(item.value),
        isArray: this.isArray(item.value),
        entries: this.isObject(item.value) ? this.getEntries(item.value) : null
      }));

      return true;
    });
  }

  hasDetailedInformation() {
    return this.data && this.data.properties && this.data.properties.assetData &&
      Object.keys(this.data.properties.assetData).length > 0;
  }

  getEntries(obj: any): { key: string, value: any }[] {
    return Object.entries(obj || {}).map(([key, value]) => ({ key, value }));
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  containsOnlyObjects(array: any[]): boolean {
    return array.every(item => this.isObject(item));
  }

  isBusy(contractOffer: Policy) {
    return this.runningNegotiations.get(contractOffer["@id"]) !== undefined || !!this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
  }

  getState(contractOffer: Policy): string {
    const transferProcess = this.runningTransferProcesses.find(tp => tp.assetId === contractOffer.assetId);
    if (transferProcess) {
      return TransferProcessStates[transferProcess.state];
    }

    const negotiation = this.runningNegotiations.get(contractOffer["@id"]);
    if (negotiation) {
      return 'negotiating';
    }

    return '';
  }

  isNegotiated(contractOffer: Policy) {
    return this.finishedNegotiations.get(contractOffer.id) !== undefined;
  }

  onNegotiateClicked(contractOffer: Policy) {
    const initiateRequest: ContractNegotiationRequest = {
      counterPartyAddress: this.data.endpointUrl,
      policy: contractOffer
    };

    this.apiService.initiateNegotiation(initiateRequest).subscribe(negotiationId => {
      this.finishedNegotiations.delete(initiateRequest.policy["@id"]);
      this.runningNegotiations.set(initiateRequest.policy["@id"], {
        id: negotiationId,
        offerId: initiateRequest.policy["@id"]
      });


      if (!this.pollingHandleNegotiation) {
        this.checkActiveNegotiations();
      }
    }, error => {
      console.error(error);
      this.notificationService.showError("Error starting negotiation");
    });
  }

  checkActiveNegotiations() {
    // there are no active negotiations
    this.pollingHandleNegotiation = setInterval(() => {

      const finishedNegotiationStates = [
        "VERIFIED",
        "TERMINATED",
        "FINALIZED",
        "ERROR"];

      for (const negotiation of this.runningNegotiations.values()) {
        this.apiService.getNegotiationState(negotiation.id).subscribe(updatedNegotiation => {
          if (finishedNegotiationStates.includes(updatedNegotiation.state)) {
            let offerId = negotiation.offerId;
            this.runningNegotiations.delete(offerId);
            const errorDetail = updatedNegotiation.optionalValue("edc", "errorDetail");
            if (updatedNegotiation["state"] === "VERIFIED" || updatedNegotiation["state"] === "FINALIZED") {
              this.finishedNegotiations.set(offerId, updatedNegotiation);
              this.notificationService.showInfo("Contract Negotiation complete!");
            } else if (updatedNegotiation["state"] === "TERMINATED" && typeof errorDetail === 'string' &&  errorDetail.includes("Contract offer is not valid")) {
              this.finishedNegotiations.set(offerId, updatedNegotiation);
              this.notificationService.showError("Contract offer is not valid.");
            }
          }

          if (this.runningNegotiations.size === 0) {
            clearInterval(this.pollingHandleNegotiation);
            this.pollingHandleNegotiation = undefined;
          }
        });
      }
    }, 1000);
  }

  getJsonPolicy(policy: Policy): any {
    return {
      permission: policy['odrl:permission'],
      prohibition: policy['odrl:prohibition'],
      obligation: policy['odrl:obligation']
    }
  }

  onPolicyDetailClick(policyCard: PolicyCard) {
    const data: JsonDialogData = {
      title: "Contract Policy JSON-LD",
      subtitle: this.data.assetId,
      icon: 'policy',
      objectForJson: policyCard.objectForJson
    };

    this.dialog.open(JsonDialogComponent, {data});
  }

  convertExpressionsToArray(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((element) => this.convertExpressionsToArray(element));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (key === 'expressions') {
            if (!Array.isArray(obj[key])) {
              newObj[key] = [this.convertExpressionsToArray(obj[key])];
            } else {
              newObj[key] = obj[key].map((item: any) => this.convertExpressionsToArray(item));
            }
          } else {
            newObj[key] = this.convertExpressionsToArray(obj[key]);
          }
        }
      }

      return newObj;
    } else {
      return obj;
    }
  }

  backToList(){
    this.router.navigate([this.data.returnUrl])
  }
}
