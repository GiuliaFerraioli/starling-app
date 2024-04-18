import React, {useState, useEffect} from "react";

const RoundupSystem = () => {
    let [amount, setAmount] = useState(0); //state to store the roundup amount
     amount = 10.558;

    const fetchAmount = async () => { //function to fetch the roundup amount 
      try {
        const response = await fetch('/api/roundup'); //api request to fetch the roundup amount
        const data = await response.json;

        setAmount(data.amount); //update the state for the roundup amount
    }catch (error) {
        console.error('Error fetching amount! ', error);
    }
};

    const TransferClick = () => { //function for the button transfer logic
      console.log('button clicked!');  
    };

    useEffect(() => {
        fetchAmount(); //call the function when component is initialised
    },[]);

    return ( //render component
        <div>
          <p>Amount rounded this week: £{amount.toFixed(2)}</p> {/*display only two decimal places*/}
          <button onClick={TransferClick}>Transfer</button>
        </div>
    );
};

export default RoundupSystem;