import async from 'async';
import Web3 from 'web3'
import BigNumber from "bignumber.js";

import {
  MAX_UINT256,
  ERROR,
  TX_SUBMITTED,
  STORE_UPDATED,
  GAUGE_UPDATED,
  CONFIGURE_GAUGES,
  GAUGES_CONFIGURED,
  GET_PROJECTS,
  PROJECTS_RETURNED,
  GET_PROJECT,
  PROJECT_RETURNED
} from './constants';

import { getSpiritContract } from '../utils/contractHelper';

import * as moment from 'moment';

import stores from './';
import { ERC20ABI } from './abis';
import { bnDec } from '../utils';

const fetch = require('node-fetch');

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      projects: [
        {
          id: 'spirit',
          name: 'Spirit Swap',
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/dapps/yearn.finance.png',
          url: 'spiritswap.finance',
          gaugeProxyAddress: '',
          tokenMetadata: {
            address: '0x1C9141857103C41D60986f76dfe6C1278E3EDAF0',
            symbol: 'spirit',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/dapps/yearn.finance.png'
          },
          veTokenMetadata: {
            address: '0xBa20Bbc0799B8654b5061668b272037d4881a0a8',
            symbol: 'veSpirit',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/dapps/yearn.finance.png'
          },
          vaults: [
            {
              address: 'addy',
              name: 'Farm 1',
              logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/dapps/yearn.finance.png'
            },
            {
              address: 'addy',
              name: 'Farm 2',
              logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/dapps/yearn.finance.png'
            },
            {
              address: 'addy',
              name: 'Farm 3',
              logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/dapps/yearn.finance.png'
            },
            {
              address: 'addy',
              name: 'Farm 4',
              logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/dapps/yearn.finance.png'
            }
          ]
        }
      ]
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE_GAUGES:
            this.configure(payload);
            break;
          case GET_PROJECTS:
            this.getProjects(payload);
            break;
          case GET_PROJECT:
            this.getProject(payload);
            break;
          default: {
          }
        }
      }.bind(this),
    );
  }

  getStore = (index) => {
    return this.store[index];
  };

  setStore = (obj) => {
    this.store = { ...this.store, ...obj };
    console.log(this.store);
    return this.emitter.emit(STORE_UPDATED);
  };

  configure = async (payload) => {
    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return null;
    }

    this.emitter.emit(GAUGES_CONFIGURED)
  };

  getProjects = async (payload) => {
    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return null;
    }

    const projects = await this._getProjects()

    this.emitter.emit(PROJECTS_RETURNED, projects)
  }

  _getProjects = async () => {
    // ...
    // get contract where we store projects
    // get project info
    // store them into the storage


    // for now just return stored projects
    return this.getStore('projects')

  }

  getProject = async (payload) => {
    const web3 = await stores.accountStore.getWeb3Provider();
    console.log('web3', web3, payload)
    if (!web3) {
      return null;
    }

    console.log(payload)

    const projects = await this._getProjects()

    console.log(projects)
    let project = projects.filter((project) => {
      return project.id === payload.content.id
    })

    console.log(project)

    if(project.length > 0) {
      project = project[0]
    }

    const account = payload.content.account;
    // getSpiritContract(project.tokenMetadata.address, Web3).methods.balanceOf()
    const balance = await getSpiritContract(project.tokenMetadata.address, Web3).methods.balanceOf(account).call();
    console.log('blance', balance);

    project.tokenMetadata.balance = new BigNumber(balance).div(bnDec(18));
    this.emitter.emit(PROJECT_RETURNED, project)
  }

  _callContract = (web3, contract, method, params, account, gasPrice, dispatchEvent, callback) => {
    const context = this;
    contract.methods[method](...params)
      .send({
        from: account.address,
        gasPrice: web3.utils.toWei(gasPrice, 'gwei'),
      })
      .on('transactionHash', function (hash) {
        context.emitter.emit(TX_SUBMITTED, hash);
        callback(null, hash);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        if (dispatchEvent && confirmationNumber === 1) {
          context.dispatcher.dispatch({ type: dispatchEvent });
        }
      })
      .on('error', function (error) {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      })
      .catch((error) => {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      });
  };
}

export default Store;
