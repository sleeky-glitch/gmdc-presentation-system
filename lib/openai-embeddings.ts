import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    })

    return response.data[0].embedding
  } catch (error) {
    console.error("[v0] Error generating embedding:", error)
    throw new Error("Failed to generate embedding")
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    })

    return response.data.map((item) => item.embedding)
  } catch (error) {
    console.error("[v0] Error generating embeddings:", error)
    throw new Error("Failed to generate embeddings")
  }
}
