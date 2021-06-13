import path from "path";
import fs from "fs";
import parse from "csv-parse";
import { Writable } from "stream";
import { pipeline } from "stream/promises";
import { ethers, BigNumber } from "ethers";
import { MultiInfuraJsonRpcProvider, addresses } from "@buynance2/shared";
import PQueue from "p-queue";
import jsonexport from "jsonexport/dist";

const infuraKeys = require(path.join(
  "..",
  "..",
  "..",
  "keys.json"
)).INFURA_API_KEYS;
const folder = "files";
const filename = "export-verified-contractaddress-opensource-license.csv";

interface Contract {
  txhash?: string;
  contractAddress: string;
  contractName: string;
  balances?: Record<string, BigNumber>;
}

async function main() {
  let contracts: Contract[] = [];
  const outStream = new Writable({
    write(chunk, encoding, callback) {
      const contract: Contract = {
        txhash: chunk[0],
        contractAddress: chunk[1],
        contractName: chunk[2],
      };
      contracts.push(contract);
      callback();
    },
    objectMode: true,
  });

  await pipeline(
    fs.createReadStream(path.resolve(__dirname, folder, filename), {
      encoding: "utf-8",
    }),
    parse({ fromLine: 3 }),
    outStream
  );

  const multiProviders = new MultiInfuraJsonRpcProvider(infuraKeys);

  contracts = contracts.slice(0, 100);

  const contractsWithBalance: Contract[] = [];
  let count: number = 0;
  const queue = new PQueue({ concurrency: 500 });
  contracts.forEach((element: Contract) => {
    queue.add(async () => {
      const bal: BigNumber = await multiProviders.provider.getBalance(
        element.contractAddress
      );
      count += 1;
      if (bal.gt(ethers.utils.parseEther("0"))) {
        element.balances = {
          eth: bal,
        };
        contractsWithBalance.push(element);
        console.log(`${count}/${contracts.length}`);
      }
      return;
    });
  });

  await queue.onIdle();

  // write to file
  console.log(`${contractsWithBalance.length} contracts found, exporting`);
  console.log(contractsWithBalance);
  await fs.promises.writeFile(
    "contracts.csv",
    await jsonexport(contractsWithBalance)
  );
}

main();
