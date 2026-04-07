// Vercel serverless function — proxies the Substack RSS feed server-side
// so the browser never makes a cross-origin request directly to Substack.
export default async function handler(req, res) {
    try {
        const response = await fetch('https://johnrubino.substack.com/feed', {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; portfolio-proxy/1.0)' }
        });

        if (!response.ok) {
            res.status(response.status).send('Upstream error');
            return;
        }

        const text = await response.text();

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        // Cache for 1 hour on CDN edge, serve stale while revalidating
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).send(text);
    } catch (err) {
        res.status(500).send('Failed to fetch feed');
    }
}
