import React, { useState } from 'react';
import { Typography, Paper, TextField, InputAdornment, Button, Tooltip, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
import { MaxUint256 } from "@ethersproject/constants";

import { formatCurrency } from '../../utils';
import classes from './veAssetGeneration.module.css';
import { getSpiritContract, getVeSpiritContract } from '../../utils/contractHelper';
import stores from "../../stores/index.js";
import { ethers } from 'ethers';

export default function VeAssetGeneration({ project }) {
  const [amount, setAmount] = useState(0);
  const [selectedDate, setSelectedDate] = React.useState(new Date('2014-08-18T21:11:54'));
  const [selectedValue, setSelectedValue] = React.useState('week');
  const [amountError, setAmountError] = useState('');
  const [dateError, setDateError] = useState('');

  const setAmountPercent = (percent) => {
    if (!project || !project.tokenMetadata) {
      return;
    }

    setAmount(BigNumber(project.tokenMetadata.balance).times(percent).div(100).toFixed(project.tokenMetadata.decimals));
  };

  const getEstmiatedAmount = () => {
    if(!amount || !selectedDate || new Date(selectedDate).getTime() < new Date().getTime()) {
      return 0;
    } else {
      let endTime = new Date(selectedDate).getTime();
      const period = 60 * 60 * 24 * 7 * 1000;
      const totalPeriod = 60 * 60 * 24 * 356 * 4 * 1000;
      endTime = parseInt(endTime / period, 10) * period;
      const receiveAmount = (endTime - new Date().getTime()) * amount / totalPeriod;
      return receiveAmount < 0 ? 0 : receiveAmount > 1000 ? 1000 : new BigNumber(receiveAmount).toFixed(4);
    }
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const onLock = async () => {
    const web3 = await stores.accountStore.getWeb3Provider();
    console.log('amount', amount);
    console.log('selectedDate', selectedDate);
    if(!amount) {
      setAmountError('Please type an amount');
      return;
    }
    setAmountError('');
    if(!selectedDate || new Date(selectedDate).getTime() < new Date().getTime()) {
      setDateError('The date should bigger than current time');
      return;
    }
    setDateError('');

    // locking
    const account = stores.accountStore.store.account.address
    try {
      const allowance = await getSpiritContract(web3).allowance(account, project.veTokenMetadata.address);
      if (allowance.eq(0)) {
        await getSpiritContract(web3).approve(project.veTokenMetadata.address, MaxUint256);
      }
      const lockedAmount = await getVeSpiritContract(web3).locked(account);
      if (!lockedAmount.amount.eq(0)) {
        await getVeSpiritContract(web3).increase_amount(ethers.utils.parseEther(amount), { gasLimit: 1000000 });
      } else {
        await getVeSpiritContract(web3).create_lock(ethers.utils.parseEther(amount), parseInt(new Date(selectedDate).getTime() / 1000, 10), { gasLimit: 1000000 });
      }
    } catch(e) {
      console.log(e);
      alert(e.toString())
    }
  };
  return (
    <Paper elevation={1} className={classes.projectCardContainer}>
      <Typography variant="h2">Generate {project && project.veTokenMetadata ? project.veTokenMetadata.symbol : 'veAsset'}</Typography>

      <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputTitle}>
            <Typography variant="h5" noWrap>
              Your {project?.tokenMetadata?.symbol} Balance
            </Typography>
          </div>
          <div className={classes.balances}>
            <Typography
              variant="h5"
              onClick={() => {
                setAmountPercent(100);
              }}
              className={classes.value}
              noWrap
            >
              Balance: {!project?.tokenMetadata?.balance ? <Skeleton /> : formatCurrency(project.tokenMetadata.balance)}
            </Typography>
          </div>
        </div>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="0.00"
          value={amount}
          error={amountError}
          helperText={amountError}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={project?.tokenMetadata?.logo} alt="" width={30} height={30} />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputTitle}>
            <Typography variant="h5" noWrap>
              Lock until
            </Typography>
          </div>
        </div>
        <TextField
          fullWidth
          id="date"
          type="date"
          defaultValue="2017-05-24"
          variant="outlined"
          className={classes.textField}
          onChange={handleDateChange}
          value={selectedDate}
          InputLabelProps={{
            shrink: true,
          }}
          error={dateError}
          helperText={dateError}
        />
      </div>
      {/* <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputTitle}>
            <Typography variant="h5" noWrap>
              Lock for
            </Typography>
          </div>
        </div>
        <RadioGroup row aria-label="position" name="position" defaultValue="top" onChange={handleChange} value={selectedValue}>
          <FormControlLabel
            value="week"
            control={<Radio color="primary" />}
            label="1 week"
            labelPlacement="bottom"
          />
          <FormControlLabel
            value="month"
            control={<Radio color="primary" />}
            label="1 month"
            labelPlacement="bottom"
          />
          <FormControlLabel
            value="year"
            control={<Radio color="primary" />}
            label="1 year"
            labelPlacement="bottom"
          />
          <FormControlLabel
            value="years"
            control={<Radio color="primary" />}
            label="4 years"
            labelPlacement="bottom"
          />
        </RadioGroup>
      </div> */}
      <div className={classes.actionButton}>
        <Button fullWidth disableElevation variant="contained" color="primary" size="large" onClick={onLock}>
          <Typography variant="h5">Lock {project?.tokenMetadata?.symbol}</Typography>
        </Button>
      </div>
      <div className={classes.calculationResults}>
        <div className={classes.calculationResult}>
          <Typography variant="h2">You will receive: {getEstmiatedAmount()}</Typography>
          <Typography variant="h2" className={classes.bold}></Typography>
        </div>
      </div>
    </Paper>
  );
}
