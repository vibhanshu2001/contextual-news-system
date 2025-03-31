export const DB_URI = "mysql://user:password@mysql:3306/news_db";
export const SUMMARIZE_LENGTH = 30;
export const SCORE_THRESHOLD=0.7;
export const NEARBY_RADIUS=100000;
export const PORT=2056;
export const GOOGLE_API_KEY=process.env.GOOGLE_API_KEY || "";
export const GOOGLE_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
export const ES_URL="http://elasticsearch:9200";
