import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ethers } from "ethers";
import { hashMessage } from 'ethers/lib/utils';

// Data Transfer Object
export class createPaymentOrderDto {
  value  : number;
  secret : string;
}

// Data Transfer Object
export class claimPaymentOrderDto {
  id  : number;
  secret : string;
  address: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get("lastblock")
  getLastBlock(): any {
    return this.appService.getBlock("latest");
  }
  @Get("block-by-hash/:hash")
  getBlockByHash(@Param('hash') hash : string): any {
    return this.appService.getBlock(hash);
  }
  @Get("totalsupply/:address")
  getTotalSupply(@Param('address') address : string): Promise<string> {
    return this.appService.getTotalSupply(address);
  }

  @Get("allowance")
  getAllowance(
    @Query ('address') address: string,
    @Query ('owner') owner : string,
    @Query ('spender') spender: string
    )  {
    return this.appService.getAllowance(address, owner, spender);
  }

  @Get("getpaymentorder/:id")
  getPaymentOrder(@Param('id') id : string)  {
    return this.appService.getPaymentOrder(id);
  }

  @Post("createpaymentorder")
  createPaymentOrder(@Body('body') body : createPaymentOrderDto)  {
    return this.appService.createPaymentOrder(body.secret, body.value);
  }

  @Post("claimpaymentorder")
  claimPaymentOrder(@Body('body') body : claimPaymentOrderDto)  {
    return this.appService.claimPaymentOrder(body.id, body.secret, body.address);
  }

}
