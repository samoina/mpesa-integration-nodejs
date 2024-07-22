// this is an async function - and i need to extend the type of the Request object so that the 
//to generate a token i use tha Authorization API to send a request
//the token obtained will be in the response object, and then this will be passed on to the next() function in the stack.
// i need to place the code in a try catch block


import axios from "axios";
import { Response, Request, NextFunction } from "express";

//this is a TS intersection type
export type RequestExtended = Request & {token? : string}

export const generateToken = async (
    req: RequestExtended, 
    res: Response, 
    next: NextFunction
) => {
    const consumerKey = process.env.CONSUMER_KEY_SANDBOX;
     const consumerSecret = process.env.CONSUMER_SECRET_SANDBOX;
     const authLink = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

     const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

     //kept getting an error because i put this as a post request instead of a 'get' request
    //  data: {
    //     requestId: '1c5b-4ba8-815c-ac45c57a3db01617180',
    //     errorCode: '404.001.03',
    //     errorMessage: 'Invalid Access Token'
    //   }
     try {
        const response = await axios(authLink, {
            headers: {
                Authorization: `Basic ${auth}`
            }
        })

        req.token = response.data.access_token;
        next();
     } catch (error:any) {
        throw new Error (`Failed to generate access token: ${error.message}`)
     }
}