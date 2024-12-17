
function apiKeyService(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === process.env.API_KEY) {
        next(); // Proceed if API key is valid
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
}

module.exports = apiKeyService;
