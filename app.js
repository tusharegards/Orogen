import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.port || 3000;

app.get('/loan', (req, res) => {
    const absPath = path.resolve('./forms/loanform.html');
    res.sendFile(absPath)
});

app.get('/', (req, res) => {
    res.send("you have reached the home page");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});