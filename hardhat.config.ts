import 'solidity-coverage';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import * as dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';
import { HardhatUserConfig} from 'hardhat/config';

dotenv.config();

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
    }
  }
};

export default config;
