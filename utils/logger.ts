import getDataFolderPath from '~/utils/getDataFolderPath';
import pino from 'pino';

// TODO: redact sensitive data from logs
// TODO: delete old logs

const date = new Date().toISOString().split('T')[0];
const logPath = getDataFolderPath('logs') + `/log-${date}.log`;

const level = process.env.LOG_LEVEL || 'trace';
const pretty = process.env.NODE_ENV === 'development';

const options = {
    level: level,
    timestamp: pino.stdTimeFunctions.isoTime,
};

const targets = [
    {
        target: 'pino/file',
        options: {
            destination: logPath
        }
    }
] as any[];

if (pretty) {
    targets.push({
        level: level,
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    });
} else {
    targets.push({
        target: 'pino/file',
    });
}

const transport = pino.transport({
    targets: targets
});

const logger = pino(options, transport);

process.on('uncaughtException', (error) => {
    logger.fatal(error, 'Uncaught Exception');
    process.exitCode = 1;
});

process.on('unhandledRejection', (error) => {
    logger.error(error, 'Unhandled Rejection');
    process.exitCode = 1;
});

export default logger;
