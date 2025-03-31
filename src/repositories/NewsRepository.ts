import { Op } from "sequelize";
import News from "../models/News";
import logger from "../utils/logger";
import { Client } from "@elastic/elasticsearch";
import { ES_URL, NEARBY_RADIUS, SCORE_THRESHOLD } from "../config/constants";

const esClient = new Client({
  node: ES_URL,
});

export class NewsRepository {
  async getNewsByCategory(category: string) {
    try {
      const filterQueries: any[] = [{ term: { category } }];

      const result = await esClient.search({
        index: "news",
        body: {
          query: {
            bool: {
              filter: filterQueries
            }
          },
          size: 5,
          sort: [
            { publication_date: "desc" }
          ]
        }
      });

      return result.body.hits.hits.map((hit: any) => hit._source);
    } catch (error: any) {
      logger.error(`Error querying Elasticsearch: ${error.message}`);
      return [];
    }
  }

  async getNewsBySource(source: string) {
    try {
      const { body } = await esClient.search({
        index: 'news',
        body: {
          query: {
            match: {
              source_name: source
            }
          },
          sort: [
            { publication_date: { order: 'desc' } }
          ],
          size: 5
        }
      });

      return body.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      logger.error('Error fetching news by source from Elasticsearch:', error);
      return [];
    }
  }

  async getTopNewsByScore(threshold: number = SCORE_THRESHOLD) {
    try {
      const result = await esClient.search({
        index: "news",
        body: {
          query: {
            range: {
              relevance_score: { gte: threshold }
            }
          },
          size: 5,
          sort: [
            { relevance_score: "desc" }
          ]
        }
      });

      return result.body.hits.hits.map((hit: any) => hit._source);
    } catch (error: any) {
      logger.error(`Error querying Elasticsearch: ${error.message}`);
      return [];
    }
  }

  async searchNews(query: string) {
    return News.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
        ],
      },
      order: [["relevance_score", "DESC"]],
      limit: 5,
    });
  }

  async getNewsByLocation(lat: number = 22.0538, lon: number = 80.6087) {
    try {
      const result = await esClient.search({
        index: "news",
        body: {
          query: {
            bool: {
              filter: [
                {
                  geo_distance: {
                    distance: `${NEARBY_RADIUS}km`,
                    location: {
                      lat: lat,
                      lon: lon
                    }
                  }
                }
              ]
            }
          },
          size: 5,
          sort: [
            {
              _geo_distance: {
                location: { lat: lat, lon: lon },
                order: "asc",
                unit: "km"
              }
            }
          ]
        }
      });

      return result.body.hits.hits.map((hit: any) => hit._source);
    } catch (error: any) {
      logger.error(`Error querying Elasticsearch: ${error.message}`);
      return [];
    }
  }

  public async searchInES(value: string, coordinates?: { lat: number; lon: number }) {
    try {
      const mustQueries: any[] = [
        { match: { title: { query: value, boost: 2 } } },
        { match: { description: { query: value } } }
      ];

      const filterQueries: any[] = [];

      if (coordinates) {
        filterQueries.push({
          geo_distance: {
            distance: "10km",
            location: {
              lat: coordinates.lat,
              lon: coordinates.lon
            }
          }
        });
      }

      const result = await esClient.search({
        index: "news",
        body: {
          query: {
            bool: {
              should: mustQueries,
              filter: filterQueries
            }
          },
          size: 5,
          min_score: 1.0,
          track_scores: true,
          sort: [
            {
              _script: {
                type: "number",
                script: {
                  source: `
                      double textScore = _score;
                      double relevance = doc.containsKey('relevance_score') ? doc['relevance_score'].value : 0.0;
                      return (textScore * 0.7) + (relevance * 0.3);
                  `,
                  lang: "painless"
                },
                order: "desc"
              }
            },
            { publication_date: "desc" }
          ]
        }
      });

      return result.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        text_matching_score: hit._score ?? 0,
      }));
    } catch (error: any) {
      logger.error(`Error querying Elasticsearch: ${error.message}`);
      return [];
    }
  }

}