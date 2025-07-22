import express from 'express';
import path from 'path';
import loanRoutes from './routes/loan.routes.js';

const app = express();
const PORT = process.env.port || 3000;
//set the view engine to ejs
app.set('view engine', 'ejs');

//to serve static files
const assets = path.join(path.resolve(), 'assets');
console.log(assets);
//set middleware to serve static files
app.use(express.static(assets))
app.use('/assets',express.static(assets))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   

// Set the document views directory
app.use('/document', loanRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});