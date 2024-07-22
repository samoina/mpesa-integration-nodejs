import express, {Request, Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { generateToken } from './middlewares/generateToken'
import handleSTKPush from './controllers/handleSTKPush'

const app=express();
dotenv.config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


//define a home route
app.get('/', function(req: Request, res: Response){
    res.send('Home reached')
    console.log('Home page reached')
});

//define a lipa route with the middleware Fn and then the controller Fn
app.post('/lipa', generateToken, handleSTKPush)

//create a route to handle the safaricom CB function and then expose iot to the internet. this will allow safaricom to send me the response
//the callback, it works because it shows me the response body(from the docs it is also known as an acknowledgement response) but not the result body. so how do i display the result from the callback?the one that contains the result body? fron the docs, it says that 'once the request is processed, send the results back to the API to then forward to the merchant thru the cb URL in the request` so use req/res still

//i imagine that the request coming in contains the results. when a transaction is successful, the api/callback-mpesa method is called again to be given the results. so its receiving something thats in the request body, so i just need to send data as req.body
//when i call this route on its own, it is a POST request and the body has the amount and phone number so it'll log it and send that as a response.

//when the result body has any other result code other than 0, it means an error occure. i got this when i had a similar transaction underway
/*
MPESA callback data {
    Body: {
      stkCallback: {
        MerchantRequestID: '2654-4b64-97ff-b827b542881d163686',
        CheckoutRequestID: 'ws_CO_18072024155701090721897270',
        ResultCode: 17,
        ResultDesc: 'Rule limited.'
      }
    }
  }
*/
app.post('/api/callback-mpesa', (req:Request, res:Response)=> {

  const callbackData = req.body;
  //below is for when calling Postman as a standalone. when testing in the sandbox, it is aleady parsed
// console.log(`dataaaaaaa isss: ${JSON.stringify(callbackData)}`);
console.log('here is the callback data!!', req.body);

    //this is what was confusing me - where does the response go to? This response goes back to MPESA, so no need to send back the data like i did before below: but, on Postman when testing with the /api/callback-mpesa, this will log under the response body.
    //in the dev environment/sandbox, this would ideally be sent or 'seen' by MPESA. additionally, the request is what comes from the phone after client puts in the PIN, the response is sent back to MPESA (PIN validation, debit the account, credit the merchant). Once this is processed by MPESA, the results are sent to the API mgt system via the CB url provided. 
    /* - for Postman
    res.send({
        message: 'MPESA endpoint reached',
        data: req.body
    })
    */
    res.json({ status: 'success' });

})

app.listen(port, function(){
    console.log(`Server running on port ${port} 🚀🌟`)
})