export default function handler(req, res) {
    const currentUrl = req.url;
    res.status(200).json(currentUrl)
}