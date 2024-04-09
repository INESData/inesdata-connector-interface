// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  jwt: {
    storageKey: 'access_token',
    storageRefreshKey: 'refresh_token'
  },
  runtime: {
    managementApiUrl: "http://localhost:29193/management",
    catalogUrl: "http://localhost:29193/management/federatedcatalog",
    storageAccount: "company2assets",
    storageExplorerLinkTemplate: "storageexplorer://v=1",
    theme: "theme-2",
    oauth2: {
      issuer: 'http://keycloak:8080/realms/dataspace',
      redirectPath: '//',
      clientId: 'management-client',
      scope: 'openid profile email',
      responseType: 'code',
      showDebugInformation: true,
      allowedUrls: 'http://localhost:4200'
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
