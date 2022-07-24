import { Body, Controller, Get, Post } from '@nestjs/common';
import { Interval, NFLoad, TotalTypes } from './nf-dto';
import { NfloadService } from './nfload.service';

@Controller('nfload')
export class NfloadController {
    constructor(private service: NfloadService) {

    }

    @Get()
    async findLoads(): Promise<NFLoad[]> {
        return this.service.findAll();
    }

    @Get("time-range")
    async timeRange(): Promise<Interval> {
        return this.service.getTimeRange();

    }

    @Post("network-function-type")
    public async nfType(@Body() body: any): Promise<string[]> {
        return this.service.getNFType(body.interval);//.from, body.interval.to);
    }

    @Post("tracking-area")
    public async trackingArea(@Body() body: any): Promise<string[]> {
        return this.service.getTrackingArea(body.interval.from, body.interval.to);
    }

    @Post("filters")
    public async filter(@Body() body: any): Promise<any> {
        return {
            "trackingArea": await this.trackingArea(body),
            "nfType": await this.nfType(body)
        }
    }

    // @Get("network-function-type1")
    // async uniqueNFType(
    //     @Query("from", ParseIntPipe) from:number,
    //     @Query("to", ParseIntPipe) to:number): Promise<string[]> {
    //    return this.service.getUniqueNFType(from, to);
    // }

    @Post("no-of-network-functions")
    async noOfNetworkFunctions(@Body() body: any): Promise<TotalTypes> {
        return this.service.getNoOfNFType(body.interval, body.filters);

    }

    @Post("overloaded-network-functions")
    async overloadedNetworkFunctions(@Body() body: any): Promise<TotalTypes> {
        console.log(body)
        return this.service.getOverloadedNFType(body.interval, body.filters);

    }

    @Post("predicted-overloaded-nf")
    async predictedOverloadedNetworkFunctions(@Body() body: any): Promise<TotalTypes> {
        console.log(body)
        return this.service.getPredictedOverloadedNFType(body.filters);
    }

    @Post("cards")
    public async cards(@Body() body: any): Promise<any> {
        return [
            await this.noOfNetworkFunctions(body),
            await this.overloadedNetworkFunctions(body)
        ];
    }


    @Post("trends")
    public async trends(@Body() body: any): Promise<any> {
        return this.service.getTrendingDetails(body.interval, body.filters);
        return {
            "trackingArea": await this.trackingArea(body),
            "nfType": await this.nfType(body)
        }
    }


}
