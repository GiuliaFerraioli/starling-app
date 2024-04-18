const axios = require('axios');
require('dotenv').config();
const app = express();

const baseURL = process.env.BASE_URL;
const accessToken = process.env.ACCESS_TOKEN;

//axios instance with configurations
const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ${accessToken}',
       }
})

//functions

//function to fetch the account details
const fetchAccountDetails= async () => {
  try {
    const response = await api.get('${baseURL}/api/v2/accounts');

  //we assume its the first account for this specific task
  const account = response.data[0];
  return { accountUid: account.accountUid, categoryUid: account.defaultCategory };
}catch (error) {
    console.error('Error fetching account details:', error);
    return null;
}
};

//function to fetch all of the transactions for the current week
const fetchTransactions = async () => {
    try {
        const { accountUid, categoryUid } = await fetchAccountDetails();
        if(!accountUid || !categoryUid){
            throw new Error('Error fetching one or more account details');
        }

        const changeSince = getStartOfWeek();
        const response = await api.get('${baseURL}/api/v2/feed/account/${accountUid}/category/${categoryUid}?changeSince=${changeSince}');
        return response.data;
    }catch (error) {
        console.error('Error fetching transactions: ',error);
    }
}

const getStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay(); //from Sunday = 0 to Saturday = 6

    day = (day == 0) ? 6 : day -1; //we can consider Monday as the first day of the week
    
    //calculate difference and set the date to the start of the week
    const difference = today.getDate() - day;
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0,0,0,0);
    
    return startOfWeek.toISOString();
}

//roundup function
const calculateRoundup = (transactions) => {
    let totalAmount = 0;

    transactions.forEach((transaction) => { 
        //roundup the value and substract it to the original amount to get the difference
        const amount = Match.ceil(transaction.amount) - transaction.amount; 

        totalAmount += amount;
    });

    return totalAmount;
}