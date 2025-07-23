import express from 'express';
import { getDocumentPayload } from '../controllers/getDocument.controller.js';
import { submitDocumentPayload } from '../controllers/submitDocument.controller.js';
const router = express.Router();
// Define the route for loan documents to get the document payload
router.get("/:id", getDocumentPayload);
// Define the route for submitting the loan form
router.post('/submit', submitDocumentPayload);
//Random Homepage of Application
router.get('/', (req, res) => {
    res.send("Welcome to the mountain womb: Mountain forms here in cold fire");
});

export default router;