import React, { useState, useEffect } from "react";
import axios from 'axios';


const RoundupSystem = () => {
  //states to store roundup amount and transfer status
  const [amount, setAmount] = useState(0);
  const [mainAccountUid, setAccountUid] = useState('');
  const [mainCategoryUid, setCategoryUid] = useState('');
  const [mainSavingsGoalUid, setSavingsGoalUid] = useState('');
  const [savingsGoalPhoto, setSavingsGoalPhoto] = useState(null);


  //roundup function
  const calculateRoundup = (transactions) => {
    let totalAmount = 0;

    transactions.forEach((transaction) => {

      //we only want to consider transfer in the account, not going out
      if (transaction.direction == "IN") {
        //convert the units in currency format, roundup the value and substract it to the original amount to get the difference
        const amount = Math.ceil(transaction.amount.minorUnits / 100) - (transaction.amount.minorUnits / 100);

        totalAmount += amount;
      }
    });

    return totalAmount;
  }

  const TransferClick = async (mainAccountUid, amount) => {
    try{ //function for the button transfer logic

    const accountResponse = await axios.get(`http://localhost:3001/api/savingsGoals?savingsAccountUid=${mainAccountUid}`);

    const { savingsGoalUid } = accountResponse.data;
    setSavingsGoalUid(savingsGoalUid);

   //convert amount to minor units
   //setAmount(Math.round(amount * 100));

   const data = {
    name: 'Trip to Paris',
    currency: 'GBP',
    target: {
        currency: 'GBP',
        minorUnits: amount
    },
    base64EncodedPhoto: 'string'
   }
   const updateAccountResponse = await axios.put(
    `http://localhost:3001/api/savingsGoals?accountUid=${mainAccountUid}&savingsGoalUid=${savingsGoalUid}`, data

  );

  console.log(updateAccountResponse);

    }catch (error) {
      console.error('Error fetching savings goal: ', error);
    }
  };

  useEffect(() => {
    const fetchTransactionsAndCalculateRoundup = async () => {
      try {
        const accountResponse = await axios.get('http://localhost:3001/api/accounts');
        const { accountUid, categoryUid } = accountResponse.data;
        setAccountUid(accountUid);
        setCategoryUid(categoryUid);

        const transactionResponse = await axios.get(`http://localhost:3001/api/transactions?transAccountUid=${accountUid}&transCategoryUid=${categoryUid}`);
        //get the incoming transactions and round them up
        const transactions = transactionResponse.data;
        const amount = calculateRoundup(transactions);
        setAmount(amount);
      } catch (error) {
        console.error('Error fetching transactions: ', error);
      }
    };

    fetchTransactionsAndCalculateRoundup();//call the function when component is initialised
  }, []);

  return ( //render component
    <div>
      <p>Amount rounded this week: £{amount.toFixed(2)}</p> {/*display only two decimal places*/}
      <button onClick={() => TransferClick(mainAccountUid, amount)}>Transfer</button>
    </div>
  );
};

export default RoundupSystem;