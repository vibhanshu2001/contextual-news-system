import { Request, Response } from "express";
import { Controller } from "../../decorators/Controller";
import { Get } from "../../decorators/Endpoint";
import { NewsRepository } from "../../repositories/NewsRepository";
import logger from "../../utils/logger";
import { GeocodingService } from "../../services/GeocodingService";
import { LLMService } from "../../services/LLMService";

@Controller("/news")
export class NewsController {
  private newsRepository: NewsRepository;
  private geocodingService: GeocodingService;

  constructor() {
    this.newsRepository = new NewsRepository();
    this.geocodingService = new GeocodingService();
  }

  @Get("/search")
  async searchNews(req: Request, res: Response) {
    try {
      const { query, location } = req.query;
      if (!query) return res.status(400).json({ error: "Missing query parameter: query" });

      let coordinates: { lat: number; lon: number } | null = null;

      if (location) {
        coordinates = await this.geocodingService.getCoordinates(location as string);
      }

      let articles = await this.searchInES(query as string, coordinates);

      articles = await Promise.all(
        articles.map(async (article: any) => ({
          ...article,
          summary: await LLMService.summarizeNews(article.description)
        }))
      );

      return res.json({ articles });
    } catch (error) {
      logger.error("Search API Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  @Get("/category")
  async getNewsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.query;
      if (!category) return res.status(400).json({ error: "Missing query parameter: category" });

      let articles = await this.newsRepository.getNewsByCategory(category as string);
      articles = await Promise.all(
        articles.map(async (article: any) => ({
          ...article,
          summary: await LLMService.summarizeNews(article.description)
        }))
      );

      return res.json({ articles });
    } catch (error) {
      logger.error("Category API Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  @Get("/source")
  async getNewsBySource(req: Request, res: Response) {
    try {
      const { source } = req.query;
      if (!source) return res.status(400).json({ error: "Missing query parameter: source" });

      let articles = await this.newsRepository.getNewsBySource(source as string);
      articles = await Promise.all(
        articles.map(async (article: any) => ({
          ...article,
          summary: await LLMService.summarizeNews(article.description)
        }))
      );

      return res.json({ articles });
    } catch (error) {
      logger.error("Source API Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  @Get("/score")
  async getNewsByScore(req: Request, res: Response) {
    try {
      const { score } = req.query;

      let articles = await this.newsRepository.getTopNewsByScore(parseFloat(score as string));
      articles = await Promise.all(
        articles.map(async (article: any) => ({
          ...article,
          summary: await LLMService.summarizeNews(article.description)
        }))
      );
      return res.json({ articles });
    } catch (error) {
      logger.error("Score API Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  @Get("/nearby")
  async getNewsNearby(req: Request, res: Response) {
    try {
      const { location = "new york" } = req.query;

      const { lat, lon } = await this.geocodingService.getCoordinates(location as string);
      let articles = await this.newsRepository.getNewsByLocation(lat, lon);
      articles = await Promise.all(
        articles.map(async (article: any) => ({
          ...article,
          summary: await LLMService.summarizeNews(article.description)
        }))
      );

      return res.json({ articles });
    } catch (error) {
      logger.error("Nearby API Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  private async searchInES(query: string, coordinates: any) {
    try {
      const result = await this.newsRepository.searchInES(query, coordinates);
      return result;
    } catch (error: any) {
      logger.error(`Error querying Elasticsearch: ${error.message}`);
      return [];
    }
  }
}