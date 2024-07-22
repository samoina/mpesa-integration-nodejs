import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { generateToken } from './middlewares/generateToken'
import handleSTKPush from './controllers/handleSTKPush'

const app = express();
dotenv.config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


//define a home route
app.get('/', function (req: Request, res: Response) {
    res.send('Home reached')
    console.log('Home page reached')
});

//define a lipa route with the middleware Fn and then the controller Fn
app.post('/lipa', generateToken, handleSTKPush)

app.post('/api/callback-mpesa', (req: Request, res: Response) => {

    const callbackData = req.body;
    console.log('here is the callback data!', req.body);

    res.json({ status: 'success' });

})

app.listen(port, function () {
    console.log(`Server running on port ${port} 🚀🌟`)
})