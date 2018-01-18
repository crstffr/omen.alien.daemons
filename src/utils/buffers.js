let Readable = require('stream').Readable;

export default class BufferUtils {

    static streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            let buffers = [];
            stream.on('error', reject);
            stream.on('data', (data) => buffers.push(data));
            stream.on('end', () => resolve(Buffer.concat(buffers)));
        });
    }

    static bufferToStream(buffer) {
        let stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }

}