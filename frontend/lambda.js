const jwt = require('jsonwebtoken');

let fetch; 

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');

exports.handler = async (event) => {
    fetch = fetch || (await import('node-fetch')).default;
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iat: now,
        exp: now + (10 * 60), // JWT expiration time set to 10 minutes
        iss: GITHUB_APP_ID
    };

    const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

    const options = {
        hostname: 'api.github.com',
        path: `/app/installations/49707483/access_tokens`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Node.js HTTP client' // GitHub requires a user-agent
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({
                        statusCode: res.statusCode,
                        body: JSON.stringify({
                            access_token: JSON.parse(data).token
                        })
                    });
                } else {
                    reject(new Error(`HTTP Status Code: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error making HTTP request:', error);
            reject({
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Failed to get installation token'
                })
            });
        });

        req.end(); // Close the request and send it
    });
};