# TAW_API



# RSS & Social Feed Aggregator

This project is a serverless RSS and social media feed aggregator built with Firebase Cloud Functions. It fetches RSS feeds from multiple sources, analyzes content (e.g., categorization, sentiment, entity extraction), checks for duplicate items, and stores them in Firestore. In addition, it fetches popular social media posts (e.g., from Twitter) using the Twitter API.

## Features

- **RSS Feed Aggregation:**  
  Fetches and processes RSS feeds from multiple URLs.

- **Social Media Integration:**  
  Fetches popular social media posts from Twitter (with duplicate-checking and media extraction).

- **Content Analysis:**  
  Categorizes articles using rule-based keyword matching, performs simple sentiment analysis, and extracts entities (people, places, organizations).

- **Duplicate Prevention:**  
  Uses a unique key (based on article title and link) to upsert documents in Firestore, avoiding duplicate entries.

- **Caching and Throttling:**  
  Implements in-memory caching with a TTL and throttles concurrent requests to optimize performance.

- **Express API Endpoints:**  
  Provides endpoints for:
  - Fetching and storing RSS feeds (`/rss`)
  - Retrieving all articles (`/articles`)
  - Retrieving articles by category (`/articles/:category`)
  - Searching articles (`/search`)
  - Retrieving related articles (`/related`)
  - Fetching social media posts (`/social` and `/socialpost`)

## Folder Structure

```
functions/
├── config/
│   └── config.js             # Global configuration (API keys, concurrency limits, etc.)
├── routes/
│   ├── articles.js           # Express routes for RSS and article endpoints
│   └── social.js             # Express routes for social media endpoints
├── services/
│   ├── rssService.js         # RSS feed fetching, processing, and storing logic
│   └── socialService.js      # Social media posts fetching and storing logic
├── utils/
│   ├── analysis.js           # Functions for categorization, sentiment analysis, and entity extraction
│   ├── helpers.js            # Utility functions (e.g., unique key generation)
│   └── throttle.js           # Functions for retrying and throttling RSS feed requests
├── feedUrls.js               # Array of RSS feed URLs
├── categoryKeywords.js       # Mapping of categories to keywords
├── sentimentKeywords.js      # Mapping of positive/negative keywords
├── index.js                  # Main entry point – sets up Express app and API endpoints
└── package.json              # Project dependencies and scripts
```

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/The-AFRICAN-WAVE-API/TAW_API.git
   cd your-repo/functions
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Firebase Project:**

   Make sure you have the Firebase CLI installed and you’re logged in:

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

4. **Configure Environment Variables:**

   Update `config/config.js` with your Firebase and API credentials (e.g., your Twitter bearer token).

## Deployment

To deploy your functions to Firebase, run:

```bash
firebase deploy --only functions
```

This command will deploy your Cloud Functions and update Firestore rules if necessary.

## Usage

Once deployed, your functions are available at your Firebase project’s URL. For example, if your function URL is:

```
https://us-central1-your-project.cloudfunctions.net/api
```

You can access the following endpoints:

- **GET /rss:**  
  Triggers RSS feed fetching, processing, and storing in Firestore.

- **GET /articles:**  
  Retrieves all stored articles.

- **GET /articles/:category:**  
  Retrieves articles for a specific category.

- **GET /search?keyword1=example:**  
  Searches articles by keyword.

- **GET /related?title=ArticleTitle:**  
  Retrieves related articles based on a given article title.

- **GET /social:**  
  Processes and stores popular social media posts.

- **GET /socialpost:**  
  Retrieves stored social media posts.

## Troubleshooting

- **JSON Parsing Errors:**  
  If you encounter JSON errors in your front end, check the Cloud Function logs in the Firebase Console for more details.

- **CORS Issues:**  
  Ensure you have `app.use(cors({ origin: "*" }))` at the top of your Express app.

- **Duplicate Entries:**  
  The unique key mechanism (using a SHA-256 hash of the title and link) prevents duplicates. If duplicates still occur, verify that your key-generation logic matches your data structure.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements or bug fixes.

## License

[MIT License](LICENSE)

---

