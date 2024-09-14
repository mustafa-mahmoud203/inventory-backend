import { v4 as uuidv4 } from "uuid";
import IHistoricalStock from "../../interfaces/historical-sotck.interface";
import HistoricalStock from "./historicalSotck.model";
import { Request, Response } from "express";

class HistoricalController {
  public async getHistoricals(req: Request, res: Response) {
    try {
      // Fetch all historical stock records
      const historicals = await HistoricalStock.scan().exec();
  
      if (!historicals || historicals.length === 0) {
        return res.status(404).json({
          message: "No historical records found",
        });
      }
  
      // Sort the records by createdAt in descending order
      const sortedHistoricals = historicals.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  
      return res.status(200).json({
        result: sortedHistoricals.length,
        historicals: sortedHistoricals,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error in retrieving historicals",
        error,
      });
    }
  }
  
}

export default HistoricalController;
