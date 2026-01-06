import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

const config = {
  solidity: '0.8.20',
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Add other networks here using process.env
  },
};

export default config;
