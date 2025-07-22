import express from 'express';
import { getDocumentPayload } from '../controllers/getDocument.controller.js';

const router = express.Router();
// Define the route for loan documents to get the document payload
router.get("/:id", getDocumentPayload);

//Random Homepage of Application
router.get('/', (req, res) => {
    res.send("you have reached the Home Page of Orogene : A process of Mountain Formation");
});

export default router;