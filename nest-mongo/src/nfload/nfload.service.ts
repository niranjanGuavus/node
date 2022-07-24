import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GranType, impactedNFSize, NFLoadResponseTitle, NFLoadSchemaName } from './constants';
import {
  FieldCounter,
  ImpactedNFInstance,
  ImpactedNFPrediction,
  Interval,
  NFAvgResUsage,
  NFLoad,
  NFLoadPrediction,
  NFProfile,
  NFTrend,
  NFTrendsCategories,
  OamResUsage,
  OverloadedNF,
  TotalTypes,
} from './nf-dto';
import { granType, isoDateStrToMillSec, roundedTime } from './utils/common-util';

@Injectable()
export class NfloadService {
  constructor(
    @InjectModel(NFLoadSchemaName.NF_LOAD_HISTORY) private nfLoadModel: Model<NFLoad>,
    @InjectModel(NFLoadSchemaName.NF_LOAD_PROFILES) private nfProfileModel: Model<NFProfile>,
    @InjectModel(NFLoadSchemaName.NF_LOAD_PREDICTION) private nfLoadPredictionModel: Model<NFLoadPrediction>,
    @InjectModel(NFLoadSchemaName.OAM_RES_USAGE) private oamResUsageModel: Model<OamResUsage>
  ) {}

  public async findAll(): Promise<NFLoad[]> {
    return this.nfLoadModel.find().limit(10).exec();
  }

  /**
   * Gives the time range(min and max time) of data available in "nfload_history" collection.
   * @returns Interval object with  "from" time to "to" time.
   */
  public async getTimeRange(): Promise<Interval> {
    const docs = await this.nfLoadModel.aggregate([
      {
        $group: {
          _id: null,
          minVal: { $min: '$nfLoadTimestamp' },
          maxVal: { $max: '$nfLoadTimestamp' },
        },
      },
    ]);
    return { from: docs[0].minVal, to: docs[0].maxVal };
  }

  /**
   * Gives all the unique network function id's present in "nfload_history" collection. based of the time range.
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @returns
   */
  private async _uniqueNfIdInRange(interval: Interval): Promise<string[]> {
    const nfIdList: string[] = await this.nfLoadModel
      .find({ nfLoadTimestamp: { $gte: interval?.from, $lt: interval?.to } })
      .distinct('nfId');
    return nfIdList;
  }

  /**
   * Gives all the unique network function name
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @returns array of network function names.
   */
  public async getNFType(interval: Interval): Promise<string[]> {
    const nfIdList = await this._uniqueNfIdInRange(interval);
    return this.nfProfileModel.find().where('nfInstanceId').in(nfIdList).distinct('nfType');
  }

  /**
   * It filter over the nfprofiles collections and get the result.
   * It needs the nfInstanceId from the other collection for comparison.
   * @param title it is a identifier to know about the response.
   * @param filter filter for the collection
   * @param nfIdList nfInstanceId list for the filter
   * @returns TotalTypes object having title, total count and it's individual count of network functions.
   */
  private async _getTotalTypes(title: string, filter: any, nfIdList: string[]): Promise<TotalTypes> {
    const matcher = {
      $and: [
        { nfInstanceId: { $in: nfIdList } },
        filter.nfTypes?.length > 0 ? { nfType: { $in: filter.nfTypes } } : {},
      ],
    };
    const list = await this.nfProfileModel
      .aggregate()
      .match(matcher)
      .group({ _id: '$nfType', count: { $sum: 1 } });

    let total: number = 0;

    const types: FieldCounter[] = list.map((item) => {
      total += item?.count;
      return { name: item._id, frequency: item.count };
    });

    return {
      title,
      total,
      types,
    };
  }

  /**
   * Gives all the network functions and it's frequency present in the network.
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param filter it contains all the filter parameter
   * @returns TotalTypes object having title, total count and it's individual count of network functions..
   */
  public async getNoOfNFType(interval: Interval, filter: any): Promise<TotalTypes> {
    const nfIdList = await this._uniqueNfIdInRange(interval);
    return this._getTotalTypes(NFLoadResponseTitle.NUM_OF_NF, filter, nfIdList);
  }

  /**
   * Gives all the network function which are currently overloaded.
   * It always the pick the last boundary time's data point load and compare with the load level value present in filter.
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param filter it contains all the filter parameter like nftype list, load level etc.
   * @returns TotalTypes object having title, total count and it's individual count of network functions..
   */
  public async getOverloadedNFType(interval: Interval, filter: any): Promise<TotalTypes> {
    const { from, to } = interval;

    const timeMatcher = {
      nfLoadTimestamp: {
        $gte: from,
        $lt: to,
      },
    };
    const groupByNfId = {
      _id: '$nfId',
      maxTime: {
        $first: '$nfLoadTimestamp',
      },
      nfLoad: {
        $first: '$nfLoad',
      },
    };

    const loadMatcher = {
      nfLoad: {
        $gt: filter?.loadLevel?.value ?? 0,
      },
    };

    const loadFilters = await this.nfLoadModel
      .aggregate()
      .match(timeMatcher)
      .sort('-nfLoadTimestamp')
      .group(groupByNfId)
      .match(loadMatcher)
      .project({ _id: 1 });

    const nfIdList = loadFilters.map((item) => item._id);

    return this._getTotalTypes(NFLoadResponseTitle.OVERLOADED_NF, filter, nfIdList);
  }

  /**
   * Gives the list of network function list which are might be overloaded in feature.
   * It is called the predicted overload.
   * @param filter contains the prediction time range, load level.
   * @returns TotalTypes object having title, total count and it's individual count of network functions.
   */
  public async getPredictedOverloadedNFType(filter: any): Promise<TotalTypes> {
    const from: number = filter?.predictedInterval?.from;
    const to: number = filter?.predictedInterval?.to;

    const timeMatcher = {
      nfLoadTimestamp: {
        $gte: from,
        $lt: to,
      },
    };
    const groupBynfId = {
      _id: '$nfId',
      maxTime: {
        $first: '$nfLoadTimestamp',
      },
      nfLoad: {
        $first: '$nfLoad',
      },
    };

    const loadMatcher = {
      nfLoad: {
        $gt: filter?.loadLevel?.value ?? 0,
      },
    };

    const loadFilters = await this.nfLoadPredictionModel
      .aggregate()
      .match(timeMatcher)
      .sort('-nfLoadTimestamp')
      .group(groupBynfId)
      .match(loadMatcher)
      .project({ _id: 1 });

    const nfIdList = loadFilters.map((item) => item._id);

    return this._getTotalTypes(NFLoadResponseTitle.PREDICTED_OVERLOADED_NF, filter, nfIdList);
  }

  /**
   * Gives overloaded nfId and it's nfLoad and peakLoad within the interval and desc sorted with nfLoad
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param filter it consumes load level and size(no of records) from filter.
   * @returns OverloadedNF which contains _id, maxTime, nfLoad, peakLoad
   */

  private async _overloadedNFList(interval: Interval, filter: any, nfIds: string[]): Promise<OverloadedNF[]> {
    const { from, to } = interval;
    const { loadLevel, size } = filter;

    const timeIdMatcher = {
      $and: [
        {
          nfLoadTimestamp: {
            $gte: from,
            $lt: to,
          },
        },
        { nfId: { $in: nfIds } },
      ],
    };

    const groupByNfId = {
      _id: '$nfId',
      maxTime: {
        $first: '$nfLoadTimestamp',
      },
      nfLoad: {
        $first: '$nfLoad',
      },
      peakLoad: {
        $max: '$nfLoad',
      },
    };

    const loadMatcher = {
      nfLoad: {
        $gt: loadLevel?.value ?? 0,
      },
    };

    const overLoadedNFList: OverloadedNF[] = await this.nfLoadModel
      .aggregate()
      .match(timeIdMatcher)
      .sort('-nfLoadTimestamp')
      .group(groupByNfId)
      .match(loadMatcher)
      .sort('-nfLoad')
      .limit(size ?? impactedNFSize);

    return overLoadedNFList;
  }

  /**
   * Gives resources used by nfs for selected time range.
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param nfIds list of nf id's .
   * @returns NFAvgResUsage which contains _id, timestamp, averageCPUUsage, averageMemoryUsage and averageStorageUsage
   */

  private async _impactedNFsResourceUsage(interval: Interval, nfIds: string[]): Promise<NFAvgResUsage[]> {
    const { from, to } = interval;
    const fromISOStr: string = new Date(from).toISOString();
    const toISOStr: string = new Date(to).toISOString();

    const timeIdMatcher = {
      $and: [
        {
          ts: {
            $gte: new Date(fromISOStr),
            $lt: new Date(toISOStr),
          },
        },
        { nfId: { $in: nfIds } },
      ],
    };

    const groupByNfId = {
      _id: '$nfId',
      averageCPUUsage: {
        $avg: '$nfCpuUsage',
      },
      averageMemoryUsage: {
        $avg: '$nfMemoryUsage',
      },
      averageStorageUsage: {
        $avg: '$nfStorageUsage',
      },
    };

    const oamResUsage: NFAvgResUsage[] = await this.oamResUsageModel
      .aggregate()
      .match(timeIdMatcher)
      .group(groupByNfId);

    return oamResUsage;
  }

  /**
   * Gives prediction details like predictedLoad, confidenceScore of nfIds
   * @param filter it consumes predictedInterval from filter.
   * @param nfIds list of impacted nfIds
   * @returns ImpactedNFPrediction which contains _id, maxTime, predictedLoad, confidenceScore
   */
  private async _impactedNFsPrediction(filter: any, nfIds: string[]): Promise<ImpactedNFPrediction[]> {
    const from: number = filter?.predictedInterval?.from;
    const to: number = filter?.predictedInterval?.to;

    const timeIdMatcher = {
      $and: [
        {
          nfLoadTimestamp: {
            $gte: from,
            $lt: to,
          },
        },
        { nfId: { $in: nfIds } },
      ],
    };
    const groupByNfId = {
      _id: '$nfId',
      maxTime: {
        $first: '$nfLoadTimestamp',
      },
      predictedLoad: {
        $first: '$nfLoad',
      },
      confidenceScore: {
        $first: '$confidenceScore',
      },
    };

    const impactedNfsPredictionList: ImpactedNFPrediction[] = await this.nfLoadPredictionModel
      .aggregate()
      .match(timeIdMatcher)
      .sort('-nfLoadTimestamp')
      .group(groupByNfId);

    return impactedNfsPredictionList;
  }

  /**
   * Gives top impacted Nf list based on the condition
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param filter it contains all the conditional parameter for filtering the records.
   * @returns list of ImpactedNFInstance, which contains details of a nf instance.
   */
  public async getImpactedNetworkFunctions(interval: Interval, filter: any): Promise<ImpactedNFInstance[]> {
    const isAllNFTypes: boolean = filter.nfTypes?.length > 0;
    const profileFilter = isAllNFTypes ? { nfType: { $in: filter.nfTypes } } : {};

    const impactedNFsDetails: NFProfile[] = await this.nfProfileModel
      .find(profileFilter)
      .select('nfInstanceId nfType nfStatus -_id')
      .lean();
    const impactedNFTypeIds = impactedNFsDetails.map(({ nfInstanceId }) => nfInstanceId);

    const overLoadedNFList: OverloadedNF[] = await this._overloadedNFList(interval, filter, impactedNFTypeIds);
    const impactedNFIds: string[] = overLoadedNFList.map(({ _id }) => _id);

    const impactedNFsPrediction: ImpactedNFPrediction[] = await this._impactedNFsPrediction(filter, impactedNFIds);
    const impactedNFsResUsage: NFAvgResUsage[] = await this._impactedNFsResourceUsage(interval, impactedNFIds);
    const impactedNFMap = new Map();

    for (const item of overLoadedNFList) {
      const { nfLoad, peakLoad, _id: nfId } = item;
      const impactedNF: ImpactedNFInstance = { nfLoad, peakLoad, nfId };
      impactedNFMap.set(nfId, impactedNF);
    }

    for (const item of impactedNFsDetails) {
      const nfId = item.nfInstanceId;
      const impactedNF: ImpactedNFInstance = impactedNFMap.get(nfId);
      if (impactedNF) {
        impactedNF.nfType = item.nfType;
        impactedNF.nfStatus = item.nfStatus;
      }
    }

    for (const item of impactedNFsResUsage) {
      const impactedNF: ImpactedNFInstance = impactedNFMap.get(item._id);
      impactedNF.averageCPUUsage = item.averageCPUUsage;
      impactedNF.averageMemoryUsage = item.averageMemoryUsage;
      impactedNF.averageStorageUsage = item.averageStorageUsage;
    }

    for (const item of impactedNFsPrediction) {
      const impactedNF: ImpactedNFInstance = impactedNFMap.get(item._id);
      impactedNF.predictedLoad = item.predictedLoad;
      impactedNF.confidence = item.confidenceScore;
    }

    return Array.from(impactedNFMap.values());
  }

  /**
   *
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param filter it contains all the conditional parameter for filtering the records.
   * @returns NFTrendsCategories object which contains nfLoad, averageLoad and peakLoad trend.
   */
  private async __nfLoadTrend(interval: Interval, filter: any, selectedNFId: string): Promise<NFTrendsCategories> {
    const loadTrendMap = new Map();
    const avgLoadTrendMap = new Map();
    const peakLoadTrendMap = new Map();
    const averageCPUUsage: NFTrend[] = [];
    const averageMemoryUsage: NFTrend[] = [];
    const averageStorageUsage: NFTrend[] = [];

    const timeGranType = granType(interval);

    const actualTrend = await this.__nfLoadGranWiseTrend(interval, filter, selectedNFId, timeGranType, false);
    const predictedTrend = await this.__nfLoadGranWiseTrend(interval, filter, selectedNFId, timeGranType, true);

    const actualResUsageTrend: NFAvgResUsage[] = await this.__nfResourceUsageGranWiseTrend(
      interval,
      selectedNFId,
      timeGranType
    );

    //merge actual with prediction
    for (const item of actualTrend) {
      let { _id, timestamp, value: actual } = item;
      timestamp = roundedTime(timeGranType, timestamp);
      const trend: NFTrend = { timestamp, actual };
      loadTrendMap.set(_id, trend);

      const avgTrend: NFTrend = { timestamp };
      avgTrend.actual = item.avgValue;
      avgLoadTrendMap.set(_id, avgTrend);

      const peakTrend: NFTrend = { timestamp };
      peakTrend.actual = item.peakValue;
      peakLoadTrendMap.set(_id, peakTrend);
    }

    for (const item of predictedTrend) {
      let { _id, timestamp, value: predicted } = item;
      timestamp = roundedTime(timeGranType, timestamp);
      const trend: NFTrend = loadTrendMap.get(_id);
      if (trend) {
        trend.predicted = predicted;
      } else {
        loadTrendMap.set(_id, { timestamp, predicted });
      }

      const avgTrend: NFTrend = avgLoadTrendMap.get(_id);
      if (avgTrend) {
        avgTrend.predicted = item.avgValue;
      } else {
        const avgTrend: NFTrend = { timestamp };
        avgTrend.predicted = item.avgValue;
        avgLoadTrendMap.set(_id, avgTrend);
      }

      const peakTrend: NFTrend = peakLoadTrendMap.get(_id);
      if (peakTrend) {
        peakTrend.predicted = item.peakValue;
      } else {
        const peakTrend: NFTrend = { timestamp };
        peakTrend.predicted = item.peakValue;
        peakLoadTrendMap.set(_id, peakTrend);
      }
    }

    actualResUsageTrend.forEach((item: NFAvgResUsage) => {
      const timestamp = roundedTime(timeGranType, isoDateStrToMillSec(item.timestamp));
      averageCPUUsage.push({ timestamp, actual: item.averageCPUUsage });
      averageMemoryUsage.push({ timestamp, actual: item.averageMemoryUsage });
      averageStorageUsage.push({ timestamp, actual: item.averageStorageUsage });
    });

    return {
      nfLoad: Array.from(loadTrendMap.values()),
      averageLoad: Array.from(avgLoadTrendMap.values()),
      peakLoad: Array.from(peakLoadTrendMap.values()),
      averageCPUUsage,
      averageMemoryUsage,
      averageStorageUsage,
    };
  }

  /**
   * Gives nf's load related information for trend data of a particular nf.
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param filter it contains all the conditional parameter for filtering the records.
   * @param selectedNFId nf id for which the trend data will generate.
   * @param granType if the number of hours more than 24 hours then it is daily otherwise hourly.
   * @param isPrediction true it used all the information for prediction trend
   * @returns trend details
   */

  private async __nfLoadGranWiseTrend(
    interval: Interval,
    filter: any,
    selectedNFId: string,
    granType: GranType,
    isPrediction: boolean = false
  ): Promise<any> {
    const model = isPrediction ? this.nfLoadPredictionModel : this.nfLoadModel;
    const { from } = interval;
    const to = isPrediction ? filter?.predictedInterval?.to : interval?.to;

    const timeField = 'nfLoadTimestamp';
    const loadField = 'nfLoad';
    const idField = 'nfId';

    const timeFieldCondition = {};
    timeFieldCondition[timeField] = {
      $gte: from,
      $lt: to,
    };

    const loadFieldCondition = {};
    loadFieldCondition[idField] = selectedNFId;

    const timeIdMatcher = {
      $and: [timeFieldCondition, loadFieldCondition],
    };

    const groupByGran = {
      _id: '$groupTimeField',
      timestamp: {
        $first: '$' + timeField,
      },
      value: {
        $first: '$' + loadField,
      },
      peakValue: {
        $max: '$' + loadField,
      },
      avgValue: {
        $avg: `$${loadField}`,
      },
    };

    let nfLoadGranTrend;
    if (granType === GranType.DAILY) {
      nfLoadGranTrend = await model
        .aggregate()
        .match(timeIdMatcher)
        .addFields({
          groupTimeField: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } },
        })
        .sort(`-${timeField}`)
        .group(groupByGran)
        .sort('timestamp');
    } else {
      nfLoadGranTrend = await model
        .aggregate()
        .match(timeIdMatcher)
        .addFields({
          date: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } },
          hour: { $dateToString: { format: '%H', date: '$ts' } },
        })
        .addFields({ incrementHour: { $add: [{ $toInt: '$hour' }, 1] } })
        .addFields({ groupTimeField: { $concat: ['$date', ':', { $toString: '$incrementHour' }] } })
        .sort(`-${timeField}`)
        .group(groupByGran)
        .sort('timestamp');
    }
    return nfLoadGranTrend;
  }

  /**
   * Gives resource usage information for trend data of a particular nf.
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param selectedNFId nf id for which the trend data will generate.
   * @param granType if the number of hours more than 24 hours then it is daily otherwise hourly.
   * @returns NFAvgResUsage NFAvgResUsage which contains _id, timestamp, averageCPUUsage, averageMemoryUsage and averageStorageUsage
   */
  private async __nfResourceUsageGranWiseTrend(
    interval: Interval,
    selectedNFId: string,
    granType: GranType
  ): Promise<NFAvgResUsage[]> {
    const timeField = 'ts';
    const { from, to } = interval;
    const fromISOStr: string = new Date(from).toISOString();
    const toISOStr: string = new Date(to).toISOString();

    const timeIdMatcher = {
      $and: [
        {
          ts: {
            $gte: new Date(fromISOStr),
            $lt: new Date(toISOStr),
          },
        },
        { nfId: selectedNFId },
      ],
    };

    const groupByGran = {
      _id: '$groupTimeField',
      timestamp: {
        $first: '$' + timeField,
      },
      averageCPUUsage: {
        $avg: '$nfCpuUsage',
      },
      averageMemoryUsage: {
        $avg: '$nfMemoryUsage',
      },
      averageStorageUsage: {
        $avg: '$nfStorageUsage',
      },
    };

    let oamResUsage: NFAvgResUsage[];
    if (granType === GranType.DAILY) {
      oamResUsage = await this.oamResUsageModel
        .aggregate()
        .match(timeIdMatcher)
        .addFields({
          groupTimeField: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } },
        })
        .group(groupByGran)
        .sort('timestamp');
    } else {
      oamResUsage = await this.oamResUsageModel
        .aggregate()
        .match(timeIdMatcher)
        .addFields({
          date: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } },
          hour: { $dateToString: { format: '%H', date: '$ts' } },
        })
        .addFields({ incrementHour: { $add: [{ $toInt: '$hour' }, 1] } })
        .addFields({ groupTimeField: { $concat: ['$date', ':', { $toString: '$incrementHour' }] } })
        .group(groupByGran)
        .sort('timestamp');
    }

    return oamResUsage;
  }

  /**
   * Gives trend details
   * @param interval it is a time interval with "from" time to "to" time. All the filtration and search over that time range data.
   * @param filter it contains all the conditional parameter for filtering the records.
   * @returns NFTrendsCategories object which contains nfLoad, averageLoad and peakLoad trend.
   */
  public async getTrendingDetails(interval: any, filter: any, selectedNFId: string): Promise<NFTrendsCategories> {
    return this.__nfLoadTrend(interval, filter, selectedNFId);
  }
}
