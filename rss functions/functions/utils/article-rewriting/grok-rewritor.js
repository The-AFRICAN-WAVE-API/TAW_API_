import request from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prompt = `

> **Act like an experienced news analyst, research assistant, and senior AI prompt engineer.** You specialize in retrieving real-time information from **primary web sources** such as news websites, blogs, and original reporting outlets. You are skilled at composing detailed, well-sourced, and neutral-toned news reports that synthesize multiple original sources into a single professional article.

> I will provide:
> - An **article title**
> - A **link to a source article** (URL)
> - The **language** to rewrite the article in (default is English)

> **Your task is to follow these steps precisely:**

> ---
> ### ✅ Step 1: Read and Analyze the Provided Article
> Open and read the article from the link. Extract the **main idea, key facts, and relevant names/dates/statistics**. This will serve as your foundation for contextualizing the topic.

> ---
> ### ✅ Step 2: Generate Search Queries
> Based on the content of the linked article, generate **3–5 search engine queries** designed to retrieve additional relevant articles from **primary sources** such as news sites and blogs. Aim to broaden coverage and validate facts.

> ---
> ### ✅ Step 3: Retrieve and Summarize Primary Sources
> Simulate retrieving **3–5 primary sources** from the web (news sites, official blogs, direct commentary). For each one, provide:
> - Title  
> - Author (if available)  
> - Source / Website  
> - Publication Date  
> - Summary of key points  
> - URL

> ---
> ### ✅ Step 4: Write a Full-Length Neutral News Report
> Using the original article and additional sources, write a **600 – 800 word** professional article in a **neutral, fact-based tone**.
> - Combine the most important and accurate information across all sources.
> - Do **not** copy or paraphrase entire sections directly from any source.
> - Use a journalistic structure (headline, intro, body, closing).
> - Attribute facts and quotes to the appropriate sources.
> - Ensure clarity, cohesion, and objectivity.

> ---
> ### ✅ Step 5: Include Proper Source Citations
> At the end, list all articles referenced using this format:
> - **Title**, Author (if known), *Source Name*, Date, [URL]

> ---
> **Important Requirements:**
> - Do **not invent** facts. Use only what appears in the linked article and found sources.
> - Do **not editorialize** or speculate — remain neutral and factual.
> - Make sure all sources are clearly cited and traceable.
> - Simulated URLs must resemble real formats.

> Take a deep breath and work on this problem step-by-step.

> Title: {{title}}
> Link: {{link}}
> Language: {{targetLanguage}}

`

export async function getGrokResponse(title, link, targetLanguage) {
  const data = JSON.stringify({
    "model": "grok-3",
    "messages": [
      {
        "role": "user",
        "content": prompt.replace("{{title}}", title).replace("{{link}}", link).replace("{{targetLanguage}}", targetLanguage)
      }
    ],
    "temperature": 0.7
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://grok3api.com/api/chat/completions',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${process.env.GROK3_API_KEY}`
    },
    data: data
  };

  try {
    const response = await request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
}
