import { Injectable } from '@nestjs/common';
import { ethers } from "ethers";
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// from TokenizedBallot
// Contract address : 0xd39595e3358477919F7eB4eafF6858CB84d8400A
import * as tokenJson from "./assets/MyToken.json";

export class PaymentOrderModel {
  id      : number;
  value  : number;
  secret : string;
}


@Injectable()
export class AppService {

  paymentOrders : PaymentOrderModel[];
  provider : ethers.providers.BaseProvider;

  constructor(private configService : ConfigService) {
    this.provider = ethers.getDefaultProvider("goerli");
    this.paymentOrders = [];
  }

  getBlock(blockTagOrHash : string) : Promise<ethers.providers.Block>{
    return this.provider.getBlock(blockTagOrHash);
  }

  async getTotalSupply(address : string) {
    const contract = new ethers.Contract(address, tokenJson.abi, this.provider);
    const ts = await contract.totalSupply();
    return ethers.utils.formatEther(ts);
  }

  async getAllowance (address : string, owner: string, spender: string) {
    const contract = new ethers.Contract(address, tokenJson.abi, this.provider);
    const bn = await contract.allowance(owner, spender)
    return ethers.utils.formatEther(bn);
  }

  getPaymentOrder(id: string) {
    return this.paymentOrders[id];
  }

  createPaymentOrder(secret: string, value: number) {
    const newPaymentOrder = new PaymentOrderModel();
    newPaymentOrder.id = this.paymentOrders.length;
    newPaymentOrder.secret = secret;
    newPaymentOrder.value = value;

    this.paymentOrders.push(newPaymentOrder);
  }

  async claimPaymentOrder(id:number, secret:string, address:string) {
    if(this.paymentOrders[id].secret != secret) throw new HttpException('wrong secret',403);
    const seed = this.configService.get<string>('MNEMONIC');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDR');
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const signer = wallet.connect(this.provider);
    const signedContract = new ethers.Contract(contractAddress, tokenJson.abi, signer);
    const tx = await signedContract.mint(address, ethers.utils.parseEther (this.paymentOrders[id].value.toString()));
    return tx.wait();
  }
}
