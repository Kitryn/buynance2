import { ethers } from "ethers";

const urlBase = "https://mainnet.infura.io/v3/";

export class MultiInfuraJsonRpcProvider {
  providers: ethers.providers.JsonRpcProvider[] = [];

  constructor(infuraApiKeys: string[]) {
    for (const apiKey of infuraApiKeys) {
      const url = `${urlBase}${apiKey}`;
      const provider = new ethers.providers.JsonRpcProvider(url);
      this.providers.push(provider);
    }
  }

  get provider() {
    const randIndex = Math.floor(Math.random() * this.providers.length);
    return this.providers[randIndex];
  }
}
