import winston from "winston";
import moment from 'moment';

const getTimestamp = () => moment().format("DD-MM-YYYY HH:mm:ss");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${getTimestamp()} [${level.toUpperCase()}]: ${JSON.stringify(message)}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true })
      )
    }),
  ],
});

export default logger;