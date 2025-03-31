import axios from "axios";
import dotenv from "dotenv";
import logger from "../utils/logger";
import {  GOOGLE_API_KEY, GOOGLE_API_URL, SUMMARIZE_LENGTH } from "../config/constants";

dotenv.config();

export class LLMService {
    static async summarizeNews(newsContent: string) {
        try {
            const prompt = `
                Summarize the following news article in ${SUMMARIZE_LENGTH} words:
                
                """
                ${newsContent}
                """
                
                Provide a concise summary in ${SUMMARIZE_LENGTH} words.
            `;

            const response = await axios.post(
                `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`,
                {
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            const candidates = response.data?.candidates || [];
            if (candidates.length === 0) {
                throw new Error("No valid response from LLM.");
            }

            return candidates[0]?.content?.parts?.[0]?.text?.trim() || newsContent;
        } catch (error: any) {
            logger.error("Error summarizing news: " + JSON.stringify(error.response?.data || error.message));
            return newsContent;
        }
    }
}