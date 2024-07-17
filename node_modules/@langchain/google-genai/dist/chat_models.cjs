"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGoogleGenerativeAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("@langchain/core/utils/env");
const chat_models_1 = require("@langchain/core/language_models/chat_models");
const runnables_1 = require("@langchain/core/runnables");
const types_1 = require("@langchain/core/utils/types");
const zod_to_genai_parameters_js_1 = require("./utils/zod_to_genai_parameters.cjs");
const common_js_1 = require("./utils/common.cjs");
const output_parsers_js_1 = require("./output_parsers.cjs");
/**
 * A class that wraps the Google Palm chat model.
 * @example
 * ```typescript
 * const model = new ChatGoogleGenerativeAI({
 *   apiKey: "<YOUR API KEY>",
 *   temperature: 0.7,
 *   modelName: "gemini-pro",
 *   topK: 40,
 *   topP: 1,
 * });
 * const questions = [
 *   new HumanMessage({
 *     content: [
 *       {
 *         type: "text",
 *         text: "You are a funny assistant that answers in pirate language.",
 *       },
 *       {
 *         type: "text",
 *         text: "What is your favorite food?",
 *       },
 *     ]
 *   })
 * ];
 * const res = await model.invoke(questions);
 * console.log({ res });
 * ```
 */
class ChatGoogleGenerativeAI extends chat_models_1.BaseChatModel {
    static lc_name() {
        return "ChatGoogleGenerativeAI";
    }
    get lc_secrets() {
        return {
            apiKey: "GOOGLE_API_KEY",
        };
    }
    get _isMultimodalModel() {
        return this.model.includes("vision") || this.model.startsWith("gemini-1.5");
    }
    constructor(fields) {
        super(fields ?? {});
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "modelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "gemini-pro"
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "gemini-pro"
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // default value chosen based on model
        Object.defineProperty(this, "maxOutputTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // default value chosen based on model
        Object.defineProperty(this, "topK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // default value chosen based on model
        Object.defineProperty(this, "stopSequences", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "safetySettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "streamUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.modelName =
            fields?.model?.replace(/^models\//, "") ??
                fields?.modelName?.replace(/^models\//, "") ??
                this.model;
        this.model = this.modelName;
        this.maxOutputTokens = fields?.maxOutputTokens ?? this.maxOutputTokens;
        if (this.maxOutputTokens && this.maxOutputTokens < 0) {
            throw new Error("`maxOutputTokens` must be a positive integer");
        }
        this.temperature = fields?.temperature ?? this.temperature;
        if (this.temperature && (this.temperature < 0 || this.temperature > 1)) {
            throw new Error("`temperature` must be in the range of [0.0,1.0]");
        }
        this.topP = fields?.topP ?? this.topP;
        if (this.topP && this.topP < 0) {
            throw new Error("`topP` must be a positive integer");
        }
        if (this.topP && this.topP > 1) {
            throw new Error("`topP` must be below 1.");
        }
        this.topK = fields?.topK ?? this.topK;
        if (this.topK && this.topK < 0) {
            throw new Error("`topK` must be a positive integer");
        }
        this.stopSequences = fields?.stopSequences ?? this.stopSequences;
        this.apiKey = fields?.apiKey ?? (0, env_1.getEnvironmentVariable)("GOOGLE_API_KEY");
        if (!this.apiKey) {
            throw new Error("Please set an API key for Google GenerativeAI " +
                "in the environment variable GOOGLE_API_KEY " +
                "or in the `apiKey` field of the " +
                "ChatGoogleGenerativeAI constructor");
        }
        this.safetySettings = fields?.safetySettings ?? this.safetySettings;
        if (this.safetySettings && this.safetySettings.length > 0) {
            const safetySettingsSet = new Set(this.safetySettings.map((s) => s.category));
            if (safetySettingsSet.size !== this.safetySettings.length) {
                throw new Error("The categories in `safetySettings` array must be unique");
            }
        }
        this.streaming = fields?.streaming ?? this.streaming;
        this.client = new generative_ai_1.GoogleGenerativeAI(this.apiKey).getGenerativeModel({
            model: this.model,
            safetySettings: this.safetySettings,
            generationConfig: {
                candidateCount: 1,
                stopSequences: this.stopSequences,
                maxOutputTokens: this.maxOutputTokens,
                temperature: this.temperature,
                topP: this.topP,
                topK: this.topK,
            },
        }, {
            apiVersion: fields?.apiVersion,
            baseUrl: fields?.baseUrl,
        });
        this.streamUsage = fields?.streamUsage ?? this.streamUsage;
    }
    getLsParams(options) {
        return {
            ls_provider: "google_genai",
            ls_model_name: this.model,
            ls_model_type: "chat",
            ls_temperature: this.client.generationConfig.temperature,
            ls_max_tokens: this.client.generationConfig.maxOutputTokens,
            ls_stop: options.stop,
        };
    }
    _combineLLMOutput() {
        return [];
    }
    _llmType() {
        return "googlegenerativeai";
    }
    bindTools(tools, kwargs) {
        return this.bind({ tools: (0, common_js_1.convertToGenerativeAITools)(tools), ...kwargs });
    }
    invocationParams(options) {
        const tools = options?.tools;
        if (Array.isArray(tools) &&
            !tools.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (t) => !("lc_namespace" in t))) {
            // Tools are in StructuredToolInterface format. Convert to GenAI format
            return {
                tools: (0, common_js_1.convertToGenerativeAITools)(options?.tools),
            };
        }
        return {
            tools: options?.tools,
        };
    }
    async _generate(messages, options, runManager) {
        const prompt = (0, common_js_1.convertBaseMessagesToContent)(messages, this._isMultimodalModel);
        const parameters = this.invocationParams(options);
        // Handle streaming
        if (this.streaming) {
            const tokenUsage = {};
            const stream = this._streamResponseChunks(messages, options, runManager);
            const finalChunks = {};
            for await (const chunk of stream) {
                const index = chunk.generationInfo?.completion ?? 0;
                if (finalChunks[index] === undefined) {
                    finalChunks[index] = chunk;
                }
                else {
                    finalChunks[index] = finalChunks[index].concat(chunk);
                }
            }
            const generations = Object.entries(finalChunks)
                .sort(([aKey], [bKey]) => parseInt(aKey, 10) - parseInt(bKey, 10))
                .map(([_, value]) => value);
            return { generations, llmOutput: { estimatedTokenUsage: tokenUsage } };
        }
        const res = await this.completionWithRetry({
            ...parameters,
            contents: prompt,
        });
        let usageMetadata;
        if ("usageMetadata" in res.response) {
            const genAIUsageMetadata = res.response.usageMetadata;
            usageMetadata = {
                input_tokens: genAIUsageMetadata.promptTokenCount ?? 0,
                output_tokens: genAIUsageMetadata.candidatesTokenCount ?? 0,
                total_tokens: genAIUsageMetadata.totalTokenCount ?? 0,
            };
        }
        const generationResult = (0, common_js_1.mapGenerateContentResultToChatResult)(res.response, {
            usageMetadata,
        });
        await runManager?.handleLLMNewToken(generationResult.generations[0].text ?? "");
        return generationResult;
    }
    async *_streamResponseChunks(messages, options, runManager) {
        const prompt = (0, common_js_1.convertBaseMessagesToContent)(messages, this._isMultimodalModel);
        const parameters = this.invocationParams(options);
        const request = {
            ...parameters,
            contents: prompt,
        };
        const stream = await this.caller.callWithOptions({ signal: options?.signal }, async () => {
            const { stream } = await this.client.generateContentStream(request);
            return stream;
        });
        let usageMetadata;
        let index = 0;
        for await (const response of stream) {
            if ("usageMetadata" in response &&
                this.streamUsage !== false &&
                options.streamUsage !== false) {
                const genAIUsageMetadata = response.usageMetadata;
                if (!usageMetadata) {
                    usageMetadata = {
                        input_tokens: genAIUsageMetadata.promptTokenCount,
                        output_tokens: genAIUsageMetadata.candidatesTokenCount,
                        total_tokens: genAIUsageMetadata.totalTokenCount,
                    };
                }
                else {
                    // Under the hood, LangChain combines the prompt tokens. Google returns the updated
                    // total each time, so we need to find the difference between the tokens.
                    const outputTokenDiff = genAIUsageMetadata.candidatesTokenCount -
                        usageMetadata.output_tokens;
                    usageMetadata = {
                        input_tokens: 0,
                        output_tokens: outputTokenDiff,
                        total_tokens: outputTokenDiff,
                    };
                }
            }
            const chunk = (0, common_js_1.convertResponseContentToChatGenerationChunk)(response, {
                usageMetadata,
                index,
            });
            index += 1;
            if (!chunk) {
                continue;
            }
            yield chunk;
            await runManager?.handleLLMNewToken(chunk.text ?? "");
        }
    }
    async completionWithRetry(request, options) {
        return this.caller.callWithOptions({ signal: options?.signal }, async () => {
            try {
                return this.client.generateContent(request);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (e) {
                // TODO: Improve error handling
                if (e.message?.includes("400 Bad Request")) {
                    e.status = 400;
                }
                throw e;
            }
        });
    }
    withStructuredOutput(outputSchema, config) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema = outputSchema;
        const name = config?.name;
        const method = config?.method;
        const includeRaw = config?.includeRaw;
        if (method === "jsonMode") {
            throw new Error(`ChatGoogleGenerativeAI only supports "functionCalling" as a method.`);
        }
        let functionName = name ?? "extract";
        let outputParser;
        let tools;
        if ((0, types_1.isZodSchema)(schema)) {
            const jsonSchema = (0, zod_to_genai_parameters_js_1.zodToGenerativeAIParameters)(schema);
            tools = [
                {
                    functionDeclarations: [
                        {
                            name: functionName,
                            description: jsonSchema.description ?? "A function available to call.",
                            parameters: jsonSchema,
                        },
                    ],
                },
            ];
            outputParser = new output_parsers_js_1.GoogleGenerativeAIToolsOutputParser({
                returnSingle: true,
                keyName: functionName,
                zodSchema: schema,
            });
        }
        else {
            let geminiFunctionDefinition;
            if (typeof schema.name === "string" &&
                typeof schema.parameters === "object" &&
                schema.parameters != null) {
                geminiFunctionDefinition = schema;
                functionName = schema.name;
            }
            else {
                geminiFunctionDefinition = {
                    name: functionName,
                    description: schema.description ?? "",
                    parameters: schema,
                };
            }
            tools = [
                {
                    functionDeclarations: [geminiFunctionDefinition],
                },
            ];
            outputParser = new output_parsers_js_1.GoogleGenerativeAIToolsOutputParser({
                returnSingle: true,
                keyName: functionName,
            });
        }
        const llm = this.bind({
            tools,
        });
        if (!includeRaw) {
            return llm.pipe(outputParser).withConfig({
                runName: "ChatGoogleGenerativeAIStructuredOutput",
            });
        }
        const parserAssign = runnables_1.RunnablePassthrough.assign({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsed: (input, config) => outputParser.invoke(input.raw, config),
        });
        const parserNone = runnables_1.RunnablePassthrough.assign({
            parsed: () => null,
        });
        const parsedWithFallback = parserAssign.withFallbacks({
            fallbacks: [parserNone],
        });
        return runnables_1.RunnableSequence.from([
            {
                raw: llm,
            },
            parsedWithFallback,
        ]).withConfig({
            runName: "StructuredOutputRunnable",
        });
    }
}
exports.ChatGoogleGenerativeAI = ChatGoogleGenerativeAI;
