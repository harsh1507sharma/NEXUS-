import {z}from "zod";
import { tool } from "ai";
import type {ActionTracker} from "../agents/action-tracker.ts";
import Firecrawl from "@mendable/firecrawl-js";
import { AgentExecutor } from "../agents/tool_executor.ts";

let client: Firecrawl | null = null;

function getClient(): Firecrawl {
  if (client) return client;
  client = new Firecrawl({
    apiKey: process.env.FIRECRAWL_API_KEY,
  });
  return client;
}

//slice kar raha hai string ko agar wo bahut lamba hai to, taki hum log usko easily handle kar sakein aur display kar sakein without overwhelming the user. Ye especially useful hai jab hum web scraping kar rahe hote hain jahan par content kaafi lamba ho sakta hai.
function clip(s: string, n = 8000): string {
  return s.length > n ? s.slice(0, n) + "\n…[truncated]" : s;
}

export function createWebTools(tracker: ActionTracker) {
  return {
    //all three tools below are related to web scraping and fetching data from the web, which can be very useful for gathering information to achieve a specific goal. The web_search tool allows you to search the web and get a list of relevant results, the web_crawl tool lets you scrape the content of a specific URL, and the fetch_url tool performs an HTTP GET request to retrieve the raw content of a URL. These tools can be used in combination to research a topic, gather data, and extract information from the web to inform decision-making or generate plans.
    web_search: tool({
      description: "Search the web. Returns title/url/snippet list.",
      inputSchema: z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(10).optional().default(5),
      }),
      execute: async ({ query, limit }) => {
        const res = await getClient().search(query, {
          limit,
          sources: ["web"],
        });

        const items = (res.web ?? []).slice(0, limit);

        const out =
          items
            .map((d, i) => {
              const title = ("title" in d && d.title) || "(untitled)";
              const url = ("url" in d && d.url) || "";
              const snip = ("snippet" in d && d.snippet) || "";
              return `${i + 1}. ${title}\n   ${url}\n   ${snip}`;
            })
            .join("\n\n") || "(no result)";

        tracker.log({
          type: "code_analysis",
          path: `web_search:${query}`,
          details: { after: out, toolName: "web_search" },
          status: "executed",
        });

        return clip(out);
      },
    }),

     web_crawl: tool({
      description: 'Scrape a URL into markdown text.',
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => {
        const doc = await getClient().scrape(url, { formats: ['markdown'] });
        const md = (doc as { markdown?: string }).markdown ?? '';
        tracker.log({
          type: 'code_analysis',
          path: `web_crawl:${url}`,
          details: { after: clip(md), toolName: 'web_crawl' },
          status: 'executed',
        });
        return clip(md) || '(empty)';
      },
    }),

    fetch_url: tool({
      description: 'HTTP GET for a URL. Returns response body.',
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => {
        const r = await fetch(url, { redirect: 'follow' });
        const body = await r.text();
        const out = clip(body, 16_000);
        tracker.log({
          type: 'code_analysis',
          path: `fetch:${url}`,
          details: { after: `HTTP ${r.status}\n\n${out}`, toolName: 'fetch_url' },
          status: 'executed',
        });
        return `HTTP ${r.status}\n\n${out}`;
      },
    }),
  };
}