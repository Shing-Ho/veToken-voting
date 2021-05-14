import { ethers } from "ethers";
import spiritAbi from '../stores/abis/Spirit.sol/Spirit.json';
import veSpiritAbi from '../stores/abis/dill/dill.vy/dill.json';
import { SPRIT_ADDR, VESPIRIT_ADDR } from './address';;

const getContract = (abi, address, provider) => {
    console.log('getContract---',  provider.getSigner())
    return new ethers.Contract(address, abi.abi, provider.getSigner())
}

export const getSpiritContract = (provider) => {
    return getContract(spiritAbi, SPRIT_ADDR, provider)
}

export const getVeSpiritContract = (provider) => {
    return getContract(veSpiritAbi, VESPIRIT_ADDR, provider)
}