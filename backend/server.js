const axios = require('axios');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = 3001;

const app = express();

app.use(cors());

//reading values from an env file
const baseURL = process.env.BASE_URL;
const accessToken = process.env.ACCESS_TOKEN;

//axios instance with configurations
const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Accept': `application/json`,
        'Authorization': `Bearer ${accessToken}`
    }
})

//API endpoints

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await fetchTransactions();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

//functions

//function to fetch the account details
const fetchAccountDetails = async () => {
    try {
        const response = await api.get(`${baseURL}/api/v2/accounts`);

        if (response.data.length === 0) {
            throw new Error('No account details found');
        }

        //we assume its the first account for this specific task
        const account = response.data.accounts[0];
        return { accountUid: account.accountUid, categoryUid: account.defaultCategory };
    } catch (error) {
        console.error('Error fetching account details:', error);
        return null;
    }
};

//function to fetch all of the transactions for the current week
const fetchTransactions = async () => {
    try {
        const { accountUid, categoryUid } = await fetchAccountDetails();

        if (!accountUid || !categoryUid) {
            throw new Error('Error fetching one or more account details');
        }

        const changeSince = getStartOfWeek();
        const response = await api.get(`${baseURL}/api/v2/feed/account/${accountUid}/category/${categoryUid}?changesSince=${changeSince}`);

        return response.data.feedItems;
    } catch (error) {
        console.error('Error fetching transactions: ', error);
    }
}

const getStartOfWeek = () => {
    const today = new Date();
    let day = today.getDay(); //from Sunday = 0 to Saturday = 6

    day = (day == 0) ? 6 : day - 1; //we can consider Monday as the first day of the week

    //calculate difference and set the date to the start of the week
    const difference = today.getDate() - day;
    const startOfWeek = new Date(today.setDate(difference));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
}

app.listen(PORT, () => {
    console.log('Server is running');
})