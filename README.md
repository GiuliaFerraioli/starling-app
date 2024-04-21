# Savings Goals API

This repository contains code for a Simple web page which displays the amount to round up for a week with a button to perform the transfer.

## Prerequisites

Before running this code, ensure you have the following installed:

- Node.js
- npm or yarn

## Usage

1. Start the backend server:

    ```bash
    cd backend
    node server.js
    ```

   The backend server will start running at `http://localhost:3001`. You can also see in the terminal a message 'Server is running'

2. Start the frontend application:

    ```bash
    cd ../frontend
    npm start
    ```

   The frontend application will open in your default web browser at `http://localhost:3000`.

3. The web page will show the rounded amount of the week. To test different amount you can use the auto simulator on the sandbox page, then refresh the web page to see an updated amount.
   The transfer button will transfer the rounded amount to the savings goal account, to test you can make a get call to the savings account to check its updated.

## Starling API documentation
https://developer.starlingbank.com/docs#api-access-1
