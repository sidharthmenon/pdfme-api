export function createApiKeyPreHandler() {
  const rawKeys = process.env.API_KEYS || '';

  const apiKeys = rawKeys
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  const authEnabled = apiKeys.length > 0;

  return async function apiKeyPreHandler(request, reply) {
    // 🔓 Auth disabled
    if (!authEnabled) return;

    const apiKey = request.headers['x-api-key'];

    if (!apiKey || !apiKeys.includes(apiKey)) {
      reply.code(401).send({
        error: 'Unauthorized: Invalid or missing API key'
      });
    }
  };
}