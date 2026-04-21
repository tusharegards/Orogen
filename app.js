import express from 'express';
import path from 'path';


const app = express();
const PORT = process.env.PORT || 3000;


//default Home Page
app.get('/', (req, res) => {
    res.render("orogen");
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});