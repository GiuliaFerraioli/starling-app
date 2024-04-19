import React, { useState, useEffect } from "react";
import axios from 'axios';


const RoundupSystem = () => {
  //states to store roundup amount and transfer status
  const [amount, setAmount] = useState(0);
  const [transferStatus, setTransferStatus] = useState(null);


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

  const TransferClick = () => { //function for the button transfer logic
    console.log('button clicked!');
  };

  useEffect(() => {
    const fetchTransactionsAndCalculateRoundup = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/transactions');
        //get the incoming transactions and round them up
        const transactions = response.data;
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
      <button onClick={TransferClick}>Transfer</button>
    </div>
  );
};

export default RoundupSystem;