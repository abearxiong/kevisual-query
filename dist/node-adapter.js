import http from 'http';

const nodeAdapter = async (opts) => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(opts.body || '');
        const _url = new URL(opts.url);
        const { hostname, port, pathname } = _url;
        const options = {
            hostname: hostname,
            port: port,
            path: pathname || '/api/router',
            method: 'POST', // Assuming it's a POST request
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                ...opts.headers,
            },
        };
        const req = http.request(options, (res) => {
            let data = '';
            // Collect data chunks
            res.on('data', (chunk) => {
                data += chunk;
            });
            // Resolve when the response is complete
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
        // Handle request errors
        req.on('error', (error) => {
            reject(error);
        });
        // Write the request body and end the request
        if (opts.body) {
            req.write(postData);
        }
        req.end();
    });
};
const adapter = nodeAdapter;

export { adapter, nodeAdapter };
