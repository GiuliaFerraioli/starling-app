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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    }
})

//API endpoints
app.get('/api/accounts', async (req, res) => {
    try {
        const account = await fetchAccountDetails();
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching account' });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const { transAccountUid, transCategoryUid } = req.query;
        const transactions = await fetchTransactions(transAccountUid, transCategoryUid);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

app.get('/api/savingsGoals', async (req, res) => {
    try {
        const { savingsAccountUid } = req.query;
        const account = await fetchSavingGoalsAccount(savingsAccountUid);
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching account' });
    }
});

app.put('/api/savingsGoals', async (req, res) => {
    try {
        const { accountUid, savingsGoalUid } = req.query;
        const amount = req.query.amount; 
        const {
            data = {
                name: 'Trip to Paris',
                currency: 'GBP',
                target: {
                    currency: 'GBP',
                    minorUnits: amount
                },
                base64EncodedPhoto: 'string'
            }
        } = req.query;

        const updatedSavingsGoal = await updateSavingGoalsAccount(accountUid, savingsGoalUid, data);
        res.json(updatedSavingsGoal);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching account', error });
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
const fetchTransactions = async (accountUid, categoryUid) => {
    try {
        const changeSince = getStartOfWeek();
        const response = await api.get(`${baseURL}/api/v2/feed/account/${accountUid}/category/${categoryUid}?changesSince=${changeSince}`);
        return response.data.feedItems;
    } catch (error) {
        console.error('Error fetching transactions: ', error);
        throw error;
    }
}

//function to fetch the first saving account
const fetchSavingGoalsAccount = async (accountUid) => {
    try {
        const response = await api.get(`${baseURL}/api/v2/account/${accountUid}/savings-goals`);
        const savingsGoalAccount = response.data.savingsGoalList[0];
        const { savingsGoalUid, name, target, totalSaved, savedPercentage, state } = savingsGoalAccount;
        return {
            savingsGoalUid,
            name,
            target,
            totalSaved,
            savedPercentage,
            state
        };
    } catch (error) {
        console.error('Error fetching saving goals account details:', error);
        throw error;
    }
}

const updateSavingGoalsAccount = async (accountUid, savingsGoalUid, data) => {
    try {
        const response = await api.put(`${baseURL}/api/v2/account/${accountUid}/savings-goals/${savingsGoalUid}`,data);
        return response.data;
    } catch (error) {
        console.error('Error updating saving goals account details:', error);
        throw error;
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