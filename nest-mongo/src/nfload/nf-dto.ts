export interface Interval {
  from: number;
  to: number;
}

export interface NFFilter {
  nfTypes: string[];
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
  nfType: string;
  nfStatus: string;
  loadTimeStamp: string;
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

export interface OamResUsage {
  _id: string;
  nfId: string;
  nfCpuUsage: number;
  nfMemoryUsage: number;
  nfStorageUsage: number;
  ts: Date;
  [key: string]: any;
}

export interface ImpactedNFInstance {
  nfId: string;
  nfLoad: number;
  peakLoad: number;
  nfType?: string;
  nfStatus?: string;
  averageCPUUsage?: number;
  averageMemoryUsage?: number;
  averageStorageUsage?: number;
  predictedLoad?: number;
  confidence?: number;
}

export interface OverloadedNF {
  _id: string;
  maxTime: number;
  nfLoad: number;
  peakLoad: number;
}

export interface ImpactedNFPrediction {
  _id: string;
  maxTime: number;
  predictedLoad: number;
  confidenceScore: number;
}

export interface NFAvgResUsage {
  _id: string;
  timestamp?: string;
  averageCPUUsage: number;
  averageMemoryUsage: number;
  averageStorageUsage: number;
}

export interface NFTrend {
  timestamp: number;
  actual?: number;
  predicted?: number;
}

export interface NFTrendsCategories {
  nfLoad: NFTrend[];
  averageLoad: NFTrend[];
  peakLoad: NFTrend[];
  averageCPUUsage: NFTrend[];
  averageMemoryUsage: NFTrend[];
  averageStorageUsage: NFTrend[];
}
