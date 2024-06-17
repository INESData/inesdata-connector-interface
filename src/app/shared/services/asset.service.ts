/**
 * EDC REST API
 * EDC REST APIs - merged by OpenApiMerger
 *
 * The version of the OpenAPI document: 0.0.1-SNAPSHOT
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, lastValueFrom } from 'rxjs';

import { expandArray, Asset, EDC_CONTEXT, JSON_LD_DEFAULT_CONTEXT } from '@think-it-labs/edc-connector-client';
import { AssetInput,  QuerySpec } from "../models/edc-connector-entities"
import { environment } from "src/environments/environment";
import { CONTEXTS } from '../utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class AssetService {

  private readonly BASE_URL = `${environment.runtime.managementApiUrl}${environment.runtime.service.asset.baseUrl}`;
  private readonly BASE_STORAGE_URL = `${environment.runtime.managementApiUrl}${environment.runtime.service.asset.storageUrl}`;

  constructor(private http: HttpClient) {
  }

  /**
   * Creates a new asset together with a data address
   * @param assetEntryDto
   */
  public createAsset(assetEntryDto: AssetInput): Observable<any> {

    let body = {
      ...assetEntryDto,
      "@context": {
        "@vocab": EDC_CONTEXT,
        "dcterms": CONTEXTS.dcterms,
        "dcat": CONTEXTS.dcat
      }
    }

    return from(lastValueFrom(this.http.post<Asset>(
      `${this.BASE_URL}`, body
    )));
  }


  /**
   * Creates a new asset together with a data address
   * @param assetEntryDto
   */
  public createStorageAsset(assetEntryDto: any): Observable<any> {

    const file: File = assetEntryDto?.file
    const blob: Blob = assetEntryDto?.blob
    delete assetEntryDto?.file
    delete assetEntryDto?.blob
    let body = {
      ...assetEntryDto,
      "@context": JSON_LD_DEFAULT_CONTEXT,
    }

    delete body.dataAddress.file

    let formdata: FormData = new FormData();

    let json = new Blob([JSON.stringify(body)], { type: "application/json" })
    formdata.append('json', json);
    formdata.append('file', blob, file?.name);

    return from(lastValueFrom(this.http.post<Asset>(
      `${this.BASE_STORAGE_URL}`, formdata
    )));
  }

  /**
   * Gets an asset with the given ID
   * @param id
   */
  public getAsset(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling getAsset.');
    }

    return from(lastValueFrom(this.http.get<Asset>(
      `${this.BASE_URL}${environment.runtime.service.asset.get}${id}`
    )));
  }

  /**
   * Removes an asset with the given ID if possible. Deleting an asset is only possible if that asset is not yet referenced by a contract agreement, in which case an error is returned. DANGER ZONE: Note that deleting assets can have unexpected results, especially for contract offers that have been sent out or ongoing or contract negotiations.
   * @param id
   */
  public removeAsset(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling removeAsset.');
    }

    return from(lastValueFrom(this.http.delete<Asset>(
      `${this.BASE_URL}${environment.runtime.service.asset.get}${id}`
    )));
  }

  /**
   * Gets all assets according to a particular query
   * @param querySpec
   */
  public requestAssets(querySpec?: QuerySpec): Observable<Array<Asset>> {
    let body;

    if(querySpec){
      body = {
        ...querySpec,
        "@context": JSON_LD_DEFAULT_CONTEXT,
      }
    }

    return from(lastValueFrom(this.http.post<Array<Asset>>(
      `${this.BASE_URL}${environment.runtime.service.asset.getAll}`, body
    )).then(results => {
      return expandArray(results, () => new Asset());
    }));
  }

  /**
   * Gets the total number of assets
   */
   public count(): Observable<number> {
    return from(lastValueFrom(this.http.get<number>(
      `${environment.runtime.managementApiUrl}${environment.runtime.service.asset.count}`
    )));
  }
}
