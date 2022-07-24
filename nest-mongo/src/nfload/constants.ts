export enum NFLoadAPIs {
  NF_LOAD = 'nf-load',
  INTERVAL = 'interval',
  NF_TYPE = 'nf-types',
  FILTERS = 'filters',
  NUM_OF_NF = 'num-of-nfs',
  OVERLOADED_NF = 'overloaded-nfs',
  PREDICTED_OVERLOADED_NF = 'predicted-overloaded-nfs',
  CARDS = 'cards',
  IMPACTED_NF = 'impacted-nfs',
  TRENDS = 'trends',
}

export enum NFLoadSchemaName {
  NF_LOAD_HISTORY = 'nfload_history',
  NF_LOAD_PROFILES = 'nfprofiles',
  NF_LOAD_PREDICTION = 'nfload_prediction',
  OAM_RES_USAGE = 'oam_res_usage_history',
}

export enum NFLoadResponseTitle {
  NUM_OF_NF = 'numberOfNFs',
  OVERLOADED_NF = 'overLoadedNfs',
  PREDICTED_OVERLOADED_NF = 'predictedOverLoadedNfs',
}

export enum GranType {
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export const impactedNFSize: number = 10;
export const millisecondsInHour: number = 3600000;
