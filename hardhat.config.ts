import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@openzeppelin/hardhat-upgrades';
import '@nomiclabs/hardhat-etherscan';
import * as dotenv from 'dotenv';

dotenv.config();


const DEFAULT_MNEMONIC = 'test test test test test test test test test test test junk';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.16'
      },
      {
        version: '0.8.15'
      },
      {
        version: '0.8.2'
      },
      {
        version: '0.6.11'
      }
    ]
  },
  networks: {
    mumbai: {
      chainId: 80001,
      url: `${process.env.RPC_URL}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: {
        mnemonic: DEFAULT_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20
      }
    }
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_KEY,
    enabled: !!process.env.REPORT_GAS,
    token: 'MATIC'
  }
};

export default config;
