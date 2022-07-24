export interface Interval {
  from: number;
  to: number;
}

export interface NFLoad {
  _id: string;
  nfId: string;
  nfLoad: number;
  ts: Date;
  nfLoadTimestamp: number;
  [key: string]: any;
}

export interface NFProfile {
  _id: string;
  nfInstanceId: string;
  nfType: number;
  nfStatus: string;
  loadTimeStamp: number;
  [key: string]: any;
}


export interface SubscribeTrainedNF {
  _id: string;
  analyticsId: string;
  nfId: string;
  startTs: number;
  latestTs: number;
  [key: string]: any;
}

export interface FieldCounter {
  name: string;
  frequency: number;
}

export interface TotalTypes {
  title: string;
  total: number;
  types: FieldCounter[];
  [key: string]: any;
}

export interface NFLoadPrediction {
  _id: string;
  nfId: string;
  nfLoad: number;
  ts: Date;
  nfLoadTimestamp: number;
  confidenceScore: number;
  [key: string]: any;
}
