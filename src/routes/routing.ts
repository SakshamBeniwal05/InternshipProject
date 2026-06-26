import { Router } from "express";
import { getAllQuotes, getQuote, newQuote, analyzeQuote, updateQuoteStatus } from "../controllers/controller.js";

const routingRouter = Router();

routingRouter.route('/quotes').get(getAllQuotes);
routingRouter.route('/quotes/:id').get(getQuote);
routingRouter.route('/quotes').post(newQuote);
routingRouter.route('/quotes/:id/analyze').post(analyzeQuote);
routingRouter.route('/quotes/:id/status').patch(updateQuoteStatus);

export default routingRouter;