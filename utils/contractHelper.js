import spiritAbi from '../stores/abis/Spirit.sol/Spirit.json';
import web3NoAccount from './web3';

const getContract = (abi, address, web3) => {
    const _web3 = web3 ?? web3NoAccount;
    console.log('_web3', _web3.eth)
    return new web3NoAccount.eth.Contract(abi.abi, address)
  }

export const getSpiritContract = (address, web3) => {
    return getContract(spiritAbi, address, web3)
}