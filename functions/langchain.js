import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { FaissStore} from "@langchain/community/vectorstores/faiss"
import { OpenAIEmbeddings, ChatOpenAI  } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings ,ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import 'dotenv/config';
import fs from 'fs'
import {
    RunnableSequence,
    RunnablePassthrough,
  } from "@langchain/core/runnables";
  import { pull } from "langchain/hub";
  import { StringOutputParser } from "@langchain/core/output_parsers";
  import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
const embedding =   new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-large",
});
const googlembedding  = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.API_KEY,
  modelName: "embedding-001"
})
const googlellm = new ChatGoogleGenerativeAI({
  model:'gemini-1.5-pro',
  apiKey:process.env.API_KEY
})
const message =`You are CodeKitty Ai to explain and  question-answering with github repo files and code . Use the following pieces of retrieved code files to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:`
let numOfLines=0
async function buildRag(path,question,filename){
  console.log('buildRag')

    const loader = new TextLoader(path); 
    const doc = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
      });
      const splits = await textSplitter.splitDocuments(doc);
       const vectorStore = await MemoryVectorStore.fromDocuments(
         splits,
         googlembedding
        );
      //  const vectorStore = await FaissStore.fromDocuments(
      //    splits, 
      //   embedding
      //  ) 
      const retriever = vectorStore.asRetriever();
     
      const prompt = ChatPromptTemplate.fromTemplate(message);
      const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 , apiKey:process.env.OPENAI_API_KEY});
    
     
      const ragChain = await createStuffDocumentsChain({
       llm,
        prompt,
        outputParser: new StringOutputParser(),
      });

      const answer = await ragChain.invoke({
        context: await retriever.invoke(question),
        question: question,
      });
        return answer;
}

export {buildRag}