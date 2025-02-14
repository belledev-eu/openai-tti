import openai from "openai";
import readline from "readline";
import fs from "fs";

// Create an instance of the OpenAI API client

const ai = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// List all models

// const models = await ai.models.list();

// models.data.forEach((model) => {
//   console.table(model);
// });

// Await for a prompt

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter a prompt: ", async (prompt) => {
  rl.pause();
  rl.resume();

  rl.question("How many images do you want to generate? ", async (count) => {
    rl.close();

    arePromptOptionsValid(prompt, count);
    await createImages(prompt, count);
  });
});

async function createImages(prompt: string, count: string) {
  try {
    const { data: images } = await ai.images.generate({
      model: "dall-e-2",
      prompt,
      response_format: "b64_json",
      n: parseInt(count),
    });

    await saveImages(images);
  } catch (_error) {
    console.error("An error occurred");
    throw _error;
  }
}

async function saveImages(images: openai.Images.Image[]) {
  const timestamp = Date.now();
  try {
    fs.mkdirSync(`./output/${timestamp}`, { recursive: true });

    images.forEach((image, index) => {
      const buffer = Buffer.from(image.b64_json ?? "", "base64");
      fs.writeFileSync(`./output/${timestamp}/image-${index}.png`, buffer);
    });

    console.log("Images saved successfully");

    return;
  } catch (_error) {
    console.error("An error occurred while saving the images");
    throw _error;
  }
}

function arePromptOptionsValid(_prompt: string, _count: string): boolean {
  switch (true) {
    case !_prompt || !_count:
      console.error("Prompt and count are required");
      return false;

    case isNaN(parseInt(_count)):
      console.error("Count must be a number");
      return false;

    case parseInt(_count) > 10 || parseInt(_count) < 1:
      console.error("Count must be between 1 and 10 (inclusive).");
      return false;

    default:
      return true;
  }
}
