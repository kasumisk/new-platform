import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

@Injectable()
export class RAGService implements OnModuleInit {
  private vectorStore: PGVectorStore;
  private llm: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const dbConfig = {
      type: 'postgres' as const,
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
    };

    this.vectorStore = await PGVectorStore.initialize(
      new OpenAIEmbeddings({
        openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      }),
      {
        postgresConnectionOptions: dbConfig,
        tableName: 'document_embeddings',
      },
    );

    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async query(question: string, clientId: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromTemplate(`
      Answer the question based only on the following context:
      
      {context}
      
      Question: {input}
    `);

    const combineDocsChain = await createStuffDocumentsChain({
      llm: this.llm as any,
      prompt: prompt as any,
    });

    const retriever = this.vectorStore.asRetriever({
      k: 4,
      filter: { client_id: clientId },
    });

    const ragChain = await createRetrievalChain({
      retriever: retriever as any,
      combineDocsChain,
    });

    const result = await ragChain.invoke({ input: question });
    return result.answer;
  }

  async uploadDocuments(texts: string[], clientId: string): Promise<void> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments(texts, [
      { client_id: clientId },
    ]);

    await this.vectorStore.addDocuments(docs);
  }
}
