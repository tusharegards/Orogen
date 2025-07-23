import express from 'express';
import path from 'path';
import loanRoutes from './routes/loan.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;
//set the view engine to ejs
app.set('view engine', 'ejs');
//to serve static files
const assets = path.join(path.resolve(), 'assets');
//set middleware to serve static files
app.use('/assets',express.static(assets))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));   

// Set the document views directory
app.use('/document', loanRoutes);

//default Home Page
app.get('/', (req, res) => {
    res.send("you have reached the Home Page of Orogene : A process of Mountain Formation");
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});