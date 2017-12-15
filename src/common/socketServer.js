
import Socket from 'ws';
import logger from '../utils/logger';

export default class SocketServer {

    wss = {};

    constructor(port) {

        this.wss = new Socket.Server({
            port: port
        });

        logger.notice(`Server started on: ws://localhost:${port}`);

        // Ping/Pong Connection Management

        this.wss.on('connection', function connection(ws, req) {

            let ip = req.connection.remoteAddress;

            ws.isAlive = true;
            ws.send(JSON.stringify({type: 'hello'}));
            logger.info(`Socket connected`);
            logger.debug(` > ip: ${ip}`);

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.on('error', error => {
                logger.error(error);
            });

            ws.on('close', (code, reason) => {
                logger.info(`Socket closed`);
                logger.debug(` > ip: ${ip}`);
                logger.debug(` > code: ${code}`);
                logger.debug(` > reason: ${reason}`);
            });

        });

        setInterval(() => {
            this.wss.clients.forEach(ws => {
                if (!ws.isAlive) {
                    logger.info('Socket terminated due to unanswered ping');
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping('', false, true);
            });
        }, 10000);

    }

    onMessage(fn) {
        this.wss.on('connection', (ws, req) => {
            ws.on('message', msg => {
                logger.debug('Message received');
                logger.debug(` > from: ${req.connection.remoteAddress}`);
                logger.debug(` > msg: ${msg}`);

                try {
                    msg = JSON.parse(msg);
                } catch(e) {
                    // msg wasn't JSON - no biggie
                }

                fn(msg, ws, req);
            });
        });
    }

    sendMessage(data) {
        this.wss.clients.forEach(ws => {
            let msg = JSON.stringify(data);
            logger.debug('Send message');
            logger.debug(` > msg: ${msg}`);
            ws.send(msg);
        });
    }

}

