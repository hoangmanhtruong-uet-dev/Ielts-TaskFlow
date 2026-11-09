require("dotenv").config({ path: ".env.local" });
const Parser = require("rss-parser");
const { OpenAI } = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");
const { createClient } = require("@supabase/supabase-js");

const parser = new Parser();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.ROUTER_API_KEY || process.env.OPENAI_API_KEY,
  // If using an AI router, specify baseURL. Otherwise, defaults to OpenAI.
  // baseURL: 'https://api.openai.com/v1',
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need admin rights to insert directly
const supabase = createClient(supabaseUrl, supabaseKey);

// Define Schema for AI Output (IELTS Reading)
const ReadingExerciseSchema = z.object({
  title: z.string().describe("Catchy title for the reading passage"),
  passage: z
    .string()
    .describe("The IELTS reading passage (approx 500-700 words)"),
  questions: z
    .array(
      z.object({
        type: z.enum([
          "multiple_choice",
          "true_false_not_given",
          "matching_headings",
        ]),
        question: z.string(),
        options: z.array(z.string()).optional(),
        correct_answer: z
          .string()
          .describe("The exact correct answer or option letter (A, B, C...)"),
        explanation: z
          .string()
          .describe(
            "Explanation of why this answer is correct based on the passage",
          ),
      }),
    )
    .length(5, "Must generate exactly 5 questions"),
  vocabulary: z
    .array(
      z.object({
        word: z.string(),
        meaning: z.string(),
        example: z.string(),
      }),
    )
    .length(5, "Must extract exactly 5 advanced vocabulary words"),
});

async function main() {
  console.log("Fetching RSS from BBC News...");
  const feed = await parser.parseURL("http://feeds.bbci.co.uk/news/rss.xml");

  // Take first 5 items to process
  const itemsToProcess = feed.items.slice(0, 5);

  for (const item of itemsToProcess) {
    console.log(`\nProcessing: ${item.title}`);
    console.log(`URL: ${item.link}`);

    try {
      console.log(
        "Generating IELTS Reading exercise using OpenAI Structured Outputs...",
      );
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert IELTS examiner and content creator. You generate highly accurate IELTS reading exercises.",
          },
          {
            role: "user",
            content: `Based on this news topic, write a 500-700 word IELTS Academic reading passage. Include 5 questions and extract 5 advanced vocabulary words. \n\nTopic: ${item.title}\nSummary: ${item.contentSnippet || item.content}`,
          },
        ],
        response_format: zodResponseFormat(
          ReadingExerciseSchema,
          "reading_exercise",
        ),
      });

      const exerciseData = completion.choices[0].message.parsed;

      console.log(
        "Successfully generated AI content. Inserting into Supabase...",
      );

      const { data, error } = await supabase
        .from("ai_generated_contents")
        .insert({
          source_url: item.link,
          content_type: "reading",
          raw_content: item.contentSnippet || item.content,
          structured_data: exerciseData,
          status: "PENDING_REVIEW",
        })
        .select();

      if (error) {
        console.error(`Supabase Error for "${item.title}":`, error.message);
      } else {
        console.log(`✓ Inserted successfully with ID: ${data[0].id}`);
      }
    } catch (err) {
      console.error(`Failed to process item "${item.title}":`, err.message);
    }
  }

  console.log("\nAI Content Generation completed!");
}

main().catch(console.error);
