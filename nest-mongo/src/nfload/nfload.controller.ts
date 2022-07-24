import { Body, Controller, Get, Post } from '@nestjs/common';

import { NFLoadAPIs } from './constants';
import { Interval, NFFilter, NFLoad, NFTrendsCategories, TotalTypes } from './nf-dto';
import { NfloadService } from './nfload.service';

@Controller(NFLoadAPIs.NF_LOAD)
export class NfloadController {
  constructor(private service: NfloadService) {}

  @Get()
  public async findLoads(): Promise<NFLoad[]> {
    return this.service.findAll();
  }

  @Get(NFLoadAPIs.INTERVAL)
  public async geTimeRange(): Promise<Interval> {
    return this.service.getTimeRange();
  }

  @Post(NFLoadAPIs.NF_TYPE)
  public async nfType(@Body() body: any): Promise<string[]> {
    return this.service.getNFType(body.interval);
  }

  @Post(NFLoadAPIs.FILTERS)
  public async filter(@Body() body: any): Promise<NFFilter> {
    return {
      nfTypes: await this.nfType(body),
    };
  }

  @Post(NFLoadAPIs.NUM_OF_NF)
  public async noOfNetworkFunctions(@Body() body: any): Promise<TotalTypes> {
    return this.service.getNoOfNFType(body.interval, body.filters);
  }

  @Post(NFLoadAPIs.OVERLOADED_NF)
  public async overloadedNetworkFunctions(@Body() body: any): Promise<TotalTypes> {
    return this.service.getOverloadedNFType(body.interval, body.filters);
  }

  @Post(NFLoadAPIs.PREDICTED_OVERLOADED_NF)
  public async predictedOverloadedNetworkFunctions(@Body() body: any): Promise<TotalTypes> {
    return this.service.getPredictedOverloadedNFType(body.filters);
  }

  @Post(NFLoadAPIs.CARDS)
  public async cards(@Body() body: any): Promise<TotalTypes[]> {
    const result: any[] = await Promise.allSettled([
      this.noOfNetworkFunctions(body),
      this.overloadedNetworkFunctions(body),
      this.predictedOverloadedNetworkFunctions(body),
    ]);
    return result.map((item) => (item.status === 'fulfilled' ? item.value : {}));
  }

  @Post(NFLoadAPIs.IMPACTED_NF)
  public async impactedNetworkFunctions(@Body() body: any): Promise<any[]> {
    return this.service.getImpactedNetworkFunctions(body.interval, body.filters);
  }

  @Post(NFLoadAPIs.TRENDS)
  public async trends(@Body() body: any): Promise<NFTrendsCategories> {
    return this.service.getTrendingDetails(body.interval, body.filters, body.selectedNFId);
  }
}
