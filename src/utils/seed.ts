import fs from "fs";
import path from "path";
import News from "../models/News";
import logger from "./logger";
import { Client } from "@elastic/elasticsearch";
import { ES_URL } from "../config/constants";

const seedFilePath = path.join(__dirname, "../../scripts/seed.json");

const esClient = new Client({
  node: ES_URL,
});

export const seedDatabase = async () => {
  try {
    const rawData = fs.readFileSync(seedFilePath, "utf-8");
    const newsArticles = JSON.parse(rawData);

    const existingIds = new Set(
      (await News.findAll({ attributes: ["id"] })).map((article: any) => article.id)
    );

    const newArticles = newsArticles.filter((article: any) => !existingIds.has(article.id));

    if (newArticles.length > 0) {
      await News.bulkCreate(newArticles, { ignoreDuplicates: true });
      logger.info(`Inserted ${newArticles.length} new articles.`);
      const esBulkOperations = newArticles.flatMap((article: any) => [
        { index: { _index: "news", _id: article.id } },
        {
          title: article.title,
          description: article.description,
          url: article.url,
          publication_date: article.publication_date,
          source_name: article.source_name,
          category: article.category,
          relevance_score: article.relevance_score,
          latitude: article.latitude,
          longitude: article.longitude,
          location: {
            lat: article.latitude,
            lon: article.longitude
          },
          summary: article.description
        },
      ]);

      const esResponse: any = await esClient.bulk({
        refresh: true,
        body: esBulkOperations
      });

      if (esResponse.errors) {
        const errorItems = esResponse.items.filter((item: any) => item.index.error);
        logger.error(`Failed to index ${errorItems.length} documents in Elasticsearch.`);
      } else {
        logger.info(`Inserted ${newArticles.length} new articles into Elasticsearch.`);
      }
    } else {
      logger.info("No new articles to insert.");
    }
  } catch (error) {
    logger.error("Error seeding database:", error);
  }
};