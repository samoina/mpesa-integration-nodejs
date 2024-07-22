// now that I have the token from the generateToken function
//from the request body ?I already have the short code, transaction type, party A, B, acct reference, transaction descr (& passkey for the PW creation)
//from the request body from the FE, i get the amount and phone #
//i have to create the PW, timestamp and CB URL
//PW -> base64 encode of the (shortcode, passkey, timestamp)
//Timestamp => YYYYMMDDHHmmss using dayjs
//callback URL - use tunnelling to create a cb url from local host ngrok

import dayjs from "dayjs";
import { Response } from "express";
import { RequestExtended } from "../middlewares/generateToken";
import axios from "axios";

const handleSTKPush = async (req: RequestExtended, res: Response)=>{
//destructure the phone and amount from the request body
    const { phone, amount } = req.body;

    //first get the timestamp using dayjs
    const year = dayjs().format("YYYY");
    const month = dayjs().format("MM");
    const date = dayjs().format("DD");
    const hour = dayjs().format("HH");
    const minute = dayjs().format("mm");
    const seconds = dayjs().format("ss");

    const timestamp = year + month + date + hour + minute + seconds;

    //create the PW using shortcode, passkey and timestamp in that order. without adding 'as string' caiuses it to be undefined
    const shortCode = process.env.SHORT_CODE_SANDBOX as string;
    const passKey = process.env.PASSKEY_SANDBOX;

    const dataToEncode = shortCode + passKey + timestamp;
    const password = Buffer.from(dataToEncode).toString('base64');

    const callbackURL = 'https://2add-41-90-64-57.ngrok-free.app/api/callback-mpesa'

    //create the payload 
const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortCode,
    PhoneNumber: phone,
    CallBackURL: callbackURL,
    AccountReference: "Samoina Test",
    TransactionDesc: "Payment",
}

//ran it on postman and got an error for bad request - invalid CB URL because i had a bloody space in my url link
try {
    const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', 
        payload,
        {
            headers : {
                //Remember the token we created? this is where we shall use it
                Authorization: `Bearer ${req.token}`
            }
        }
    )

    console.log(response.data)
    res.status(201).json({
        message: true,
        data: response.data
    })
} catch (error: any) {
    console.log(error);
    res.status(500).json({
        message: 'failed',
        error: error.message
    })
}

}
export default handleSTKPush;
