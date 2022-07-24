
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FieldCounter, Interval, NFLoad, NFLoadPrediction, NFProfile, SubscribeTrainedNF, TotalTypes } from './nf-dto';

@Injectable()
export class NfloadService {
    constructor(@InjectModel('nfLoad') private nfLoadModel: Model<NFLoad>,
        @InjectModel('nfProfile') private nfProfileModel: Model<NFProfile>,
        @InjectModel('nfLoadPrediction') private nfLoadPredictionModel: Model<NFLoadPrediction>,
        @InjectModel('subscribedTrainedNFStatus') private subscribeTrainedModel: Model<SubscribeTrainedNF>,) {

    }

    async findAll(): Promise<NFLoad[]> {
        return this.nfLoadModel.find().limit(2).exec();
    }


    async getTimeRange(): Promise<Interval> {
        let docs = await this.nfLoadModel.aggregate([
            {
                $group: {
                    _id: null,
                    minVal: { $min: "$nfLoadTimestamp" },
                    maxVal: { $max: "$nfLoadTimestamp" }
                }
            }
        ])
        return { from: docs[0].minVal, to: docs[0].maxVal }
    }

    // async getTimeRange(): Promise<Interval> {
    //     let minTime =  await this.nfloadModel.find({}).sort({ nfLoadTimestamp: 1 }).limit(1).then(items => items[0].nfLoadTimestamp);
    //     let maxTime =  await this.nfloadModel.find({}).sort({ nfLoadTimestamp: -1 }).limit(1).then(items => items[0].nfLoadTimestamp);
    //     return { from: minTime, to: maxTime }
    // }




    public async getNFType(timeRange: Interval): Promise<any[]> { //from: number, to: number): Promise<any[]> {
        const nfIdList = await this.nfLoadModel.find({ nfLoadTimestamp: { $gte: timeRange.from, $lt: timeRange.to } }).distinct("nfId");
        return this.nfProfileModel.find().where('nfInstanceId').in(nfIdList).distinct('nfType');


        // const nfIdList = await this.subscribeTrainedModel.find().or([
        //     { startTs: { $gte: from, $lt: to } },
        //     { latestTs: { $gte: from, $lt: to } }
        // ]).distinct("nfId");
        // return this.nfProfileModel.find().where('nfInstanceId').in(nfIdList).distinct('nfType');



        /*
        // with nested logical operator like mongoDB 
         const result1 = await this.subscribeTrainedModel.find(
             {
                 $or: [
                     { startTs: { $gte: from, $lt: to } },
                     { latestTs: { $gte: from, $lt: to } }
                 ]
             }
         ).select(["nfId", "-_id"]).exec();
        return await this.nfProfileModel.find({nfInstanceId : {$in :nfIdList}}).distinct('nfType');
        */
    }

    public async getTrackingArea(from: number, to: number): Promise<string[]> {
        return ["TA10x2752", "MF87x2752", "MF87x2213", "MF87x5632"];
    }


    public async getNoOfNFType(interval: any, filter: any): Promise<TotalTypes> {
        let total: number = 0;
        let types: FieldCounter[];
        const from = interval.from;
        const to = interval.to;

        const nfIdList = await this.nfLoadModel.find({ nfLoadTimestamp: { $gte: from, $lt: to } }).distinct("nfId");

        const matcher = {
            $and: [
                { nfInstanceId: { $in: nfIdList } },
                filter.nfType?.length > 0 ? { nfType: { $in: filter.nfType } } : {}

            ]
        }
        const list = await this.nfProfileModel.aggregate().match(matcher).group({ _id: "$nfType", count: { $sum: 1 } });


        types = list.map((item) => {
            total += item?.count;
            const nfType: string = item['_id'];
            return { name: item['_id'], frequency: item.count };
        });

        return {
            title: "Number of NF's",
            total,
            types
        }
    }

    public async getOverloadedNFType(interval: any, filter: any): Promise<TotalTypes> {
        let total: number = 0;
        let types: FieldCounter[];
        const from = interval.from;
        const to = interval.to;


        const timeMatcher = {
            nfLoadTimestamp: {
                $gte: from,
                $lt: to
            }
        };
        const groupBynfId = {
            '_id': '$nfId',
            'maxTime': {
                '$first': '$nfLoadTimestamp'
            },
            'nfLoad': {
                '$first': '$nfLoad'
            }
        };

        const loadMatcher = {
            'nfLoad': {
                '$gt': filter?.loadLevel?.value ?? 0
            }
        };


        const loadFilters = await this.nfLoadModel
            .aggregate()
            .match(timeMatcher)
            .sort("-nfLoadTimestamp")
            .group(groupBynfId)
            .match(loadMatcher)
            .project({ _id: 1 });

        const nfIdList = loadFilters.map(item => item._id);

        const nfProfileMatcher = {
            $and: [
                { nfInstanceId: { $in: nfIdList } },
                filter.nfType?.length > 0 ? { nfType: { $in: filter.nfType } } : {}

            ]
        }

        const list = await this.nfProfileModel.aggregate().match(nfProfileMatcher).group({ _id: "$nfType", count: { $sum: 1 } });


        types = list.map((item) => {
            total += item?.count;
            const nfType: string = item['_id'];
            return { name: item['_id'], frequency: item.count };
        });

        return {
            title: "Overloaded NF's",
            total,
            types
        }

    }

    public async getPredictedOverloadedNFType(filter: any): Promise<TotalTypes> {
        let total: number = 0;
        let types: FieldCounter[];
        const from: number = filter?.predictedInterval?.from;
        const to: number = filter?.predictedInterval?.to;


        const timeMatcher = {
            nfLoadTimestamp: {
                $gte: from,
                $lt: to
            }
        };
        const groupBynfId = {
            '_id': '$nfId',
            'maxTime': {
                '$first': '$nfLoadTimestamp'
            },
            'nfLoad': {
                '$first': '$nfLoad'
            }
        };

        const loadMatcher = {
            'nfLoad': {
                '$gt': filter?.loadLevel?.value ?? 0
            }
        };


        const loadFilters = await this.nfLoadPredictionModel
            .aggregate()
            .match(timeMatcher)
            .sort("-nfLoadTimestamp")
            .group(groupBynfId)
            .match(loadMatcher)
            .project({ _id: 1 });

        const nfIdList = loadFilters.map(item => item._id);

        const nfProfileMatcher = {
            $and: [
                { nfInstanceId: { $in: nfIdList } },
                filter.nfType?.length > 0 ? { nfType: { $in: filter.nfType } } : {}

            ]
        }

        const list = await this.nfProfileModel.aggregate().match(nfProfileMatcher).group({ _id: "$nfType", count: { $sum: 1 } });


        types = list.map((item) => {
            total += item?.count;
            const nfType: string = item['_id'];
            return { name: item['_id'], frequency: item.count };
        });

        return {
            title: "Predicted Overloaded NF's",
            total,
            types
        }

    }



    public async getTrendingDetails(interval: any, filter: any): Promise<any> {

        const from: number = interval.from;
        const to: number = interval.to;
        const selectedNFId: string = filter.selectedNFId;
        const timeMatcher = {
            $and: [
                {
                    nfLoadTimestamp: {
                        $gte: from,
                        $lt: to
                    }
                },
                { nfId: selectedNFId }
            ]

        };

        const groupByHourly = {
            '_id': '$dateWithHour',
            'maxTime': {
                '$first': '$nfLoadTimestamp'
            },
            'nfLoad': {
                '$first': '$nfLoad'
            }
        };

        // const groupByHourly = {
        //     '_id': '$dateWithHour',
        //     'maxTime': {
        //         '$max': '$nfLoadTimestamp'
        //     },
        //     "docs": { "$push": { 
        //         "nfLoad": "$nfLoad", 
        //     }}
        // };

        let res = await this.nfLoadModel
            .aggregate()
            .match(timeMatcher)
            .addFields({
                "date": { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
                "hour": { $dateToString: { format: "%H", date: "$ts" } }
            })
            .addFields({ currentHour: { $add: [{ '$toInt': "$hour" }, 1] } })
            .addFields({ dateWithHour: { $concat: ["$date", ":", { "$toString": "$currentHour" }] } })
            .sort("-nfLoadTimestamp")
            .group(groupByHourly)
            .sort("maxTime");

    }


    public async getUniqueNFType(from: number, to: number): Promise<string[]> {

        const matcher = {
            $or:
                [
                    { startTs: { $gte: from, $lt: to } },
                    { latestTs: { $gte: from, $lt: to } }
                ]
        };
        const lookup = {
            from: 'nfprofiles',
            localField: 'nfId',
            foreignField: 'nfInstanceId',
            as: 'profiles'
        }

        const list = await this.subscribeTrainedModel
            .aggregate()
            .match(matcher)
            .lookup(lookup)
            .unwind('$profiles')
            .addFields({ "nfType": "$profiles.nfType" })
            .group({ _id: "$nfType" });

        return list.map(item => item._id);
    }

/*
    db.coll.aggregate([
        { "$group":{ 
            "_id": "$country",
            "maxQuantity": { "$max": "$quantity" },
            "docs": { "$push": {
                "_id": "$_id",
                "name": "$name",
                "quantity": "$quantity"
            }}
        }},
        { "$project": {
            "maxQuantity": 1,
            "docs": {
                "$filter": {
                  "input": "$docs",
                  "as": "doc",
                  "cond": { $eq: ["$$doc.quantity", "$maxQuantity"] }
                }
            }
        }}
    ])
*/

    /*
        public async getNoOfNFType(interval: any, filter: any): Promise<TotalTypes> {
            let total: number = 0;
            let types: FieldCounter[];
            const from = interval.from;
            const to = interval.to;
            const matcher = {
                $or:
                    [
                        { startTs: { $gte: from, $lt: to } },
                        { latestTs: { $gte: from, $lt: to } }
                    ]
            };
            // const lookup = {
            //     from: 'nfprofiles',
            //     localField: 'nfId',
            //     foreignField: 'nfInstanceId',
            //     as: 'profiles'
            // }
    
            const lookup = {
                from: 'nfprofiles',
                let: { sub_nfId: "$nfId" },
                pipeline: [ {
                    $match: {
                    $expr: {
                        $and: [
                            {$eq: [ "$nfInstanceId", "$$sub_nfId", ]},
                            filter.nfType?.length > 0 ? {$in: [ "$nfType", filter.nfType, ]} : {}
                        ]
                        
                        }
                    }
                } ],
                as: 'profiles'
            }
    
            
    
            const nfTypeMatch = filter.nfType?.length > 0 ? { nfType: { $in: filter.nfType } } : {}
            // 
    
            const list = await this.subscribeTrainedModel
                .aggregate()
                .match(matcher)
                .lookup(lookup)
                .unwind('$profiles')
                .group({ _id: "$profiles.nfType", count: { $sum: 1 } });
                //.addFields({ "nfType": "$profiles.nfType" })
                //.match(nfTypeMatch)
                //.group({ _id: "$nfType", count: { $sum: 1 } });
    
    
            types = list.map((item) => {
                total += item?.count;
                const nfType: string = item['_id'];
                return { name: item['_id'], frequency: item.count };
            });
    
            return {
                title: "Number of NF's",
                total,
                types
            }
        }
        */

    /*
    public async getOverloadedNFType(interval: any, filter: any): Promise<TotalTypes> {
        let total: number = 0;
        let types: FieldCounter[];
        const from = interval.from;
        const to = interval.to;
        const matcher = {
            $or:
                [
                    { startTs: { $gte: from, $lt: to } },
                    { latestTs: { $gte: from, $lt: to } }
                ]
        };
        // const lookup = {
        //     from: 'nfprofiles',
        //     localField: 'nfId',
        //     foreignField: 'nfInstanceId',
        //     as: 'profiles'
        // }

        const lookup = {
            from: 'nfprofiles',
            let: { sub_nfId: "$nfId" },
            pipeline: [ {
                $match: {
                $expr: {
                    $and: [
                        {$eq: [ "$nfInstanceId", "$$sub_nfId", ]},
                        filter.nfType?.length > 0 ? {$in: [ "$nfType", filter.nfType, ]} : {}
                    ]
                    
                    }
                }
            } ],
            as: 'profiles'
        }

        

        const nfTypeMatch = filter.nfType?.length > 0 ? { nfType: { $in: filter.nfType } } : {}
        // 

        const list = await this.subscribeTrainedModel
            .aggregate()
            .match(matcher)
            .lookup(lookup)
            .unwind('$profiles')
            .group({ _id: "$profiles.nfType", count: { $sum: 1 } });
            //.addFields({ "nfType": "$profiles.nfType" })
            //.match(nfTypeMatch)
            //.group({ _id: "$nfType", count: { $sum: 1 } });


        types = list.map((item) => {
            total += item?.count;
            const nfType: string = item['_id'];
            return { name: item['_id'], frequency: item.count };
        });

        return {
            title: "Number of NF's",
            total,
            types
        }
    }
    */





}


// db.subscribed_trained_nf_status.aggregate([
//         { $match:
//             {
//                 $or:
//                 [
//                     { startTs: { $gte: 1651363200000, $lt: 1653456566000 } },
//                     { latestTs: { $gte: 1651363200000, $lt: 1653456566000 } }
//                 ]
//             }
//         },
//         {$lookup: {
//             from: 'nfprofiles',
//             localField: 'nfId',
//             foreignField: 'nfInstanceId',
//             as: 'profiles'
//         }},
//         { $unwind: '$profiles' },
//         { $addFields: { "nfType": "$profiles.nfType",}},
//         { $group : { _id : "$nfType" } },
//     ])


