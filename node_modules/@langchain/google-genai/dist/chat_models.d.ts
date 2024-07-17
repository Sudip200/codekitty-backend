import { FunctionDeclarationsTool as GoogleGenerativeAIFunctionDeclarationsTool, GenerateContentRequest, SafetySetting, Part as GenerativeAIPart } from "@google/generative-ai";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { ChatGenerationChunk, ChatResult } from "@langchain/core/outputs";
import { BaseChatModel, LangSmithParams, type BaseChatModelParams } from "@langchain/core/language_models/chat_models";
import { BaseLanguageModelCallOptions, BaseLanguageModelInput, StructuredOutputMethodOptions, ToolDefinition } from "@langchain/core/language_models/base";
import { StructuredToolInterface } from "@langchain/core/tools";
import { Runnable, RunnableToolLike } from "@langchain/core/runnables";
import type { z } from "zod";
export type BaseMessageExamplePair = {
    input: BaseMessage;
    output: BaseMessage;
};
export interface GoogleGenerativeAIChatCallOptions extends BaseLanguageModelCallOptions {
    tools?: StructuredToolInterface[] | GoogleGenerativeAIFunctionDeclarationsTool[];
    /**
     * Whether or not to include usage data, like token counts
     * in the streamed response chunks.
     * @default true
     */
    streamUsage?: boolean;
}
/**
 * An interface defining the input to the ChatGoogleGenerativeAI class.
 */
export interface GoogleGenerativeAIChatInput extends BaseChatModelParams, Pick<GoogleGenerativeAIChatCallOptions, "streamUsage"> {
    /**
     * Model Name to use
     *
     * Alias for `model`
     *
     * Note: The format must follow the pattern - `{model}`
     */
    modelName?: string;
    /**
     * Model Name to use
     *
     * Note: The format must follow the pattern - `{model}`
     */
    model?: string;
    /**
     * Controls the randomness of the output.
     *
     * Values can range from [0.0,1.0], inclusive. A value closer to 1.0
     * will produce responses that are more varied and creative, while
     * a value closer to 0.0 will typically result in less surprising
     * responses from the model.
     *
     * Note: The default value varies by model
     */
    temperature?: number;
    /**
     * Maximum number of tokens to generate in the completion.
     */
    maxOutputTokens?: number;
    /**
     * Top-p changes how the model selects tokens for output.
     *
     * Tokens are selected from most probable to least until the sum
     * of their probabilities equals the top-p value.
     *
     * For example, if tokens A, B, and C have a probability of
     * .3, .2, and .1 and the top-p value is .5, then the model will
     * select either A or B as the next token (using temperature).
     *
     * Note: The default value varies by model
     */
    topP?: number;
    /**
     * Top-k changes how the model selects tokens for output.
     *
     * A top-k of 1 means the selected token is the most probable among
     * all tokens in the model’s vocabulary (also called greedy decoding),
     * while a top-k of 3 means that the next token is selected from
     * among the 3 most probable tokens (using temperature).
     *
     * Note: The default value varies by model
     */
    topK?: number;
    /**
     * The set of character sequences (up to 5) that will stop output generation.
     * If specified, the API will stop at the first appearance of a stop
     * sequence.
     *
     * Note: The stop sequence will not be included as part of the response.
     * Note: stopSequences is only supported for Gemini models
     */
    stopSequences?: string[];
    /**
     * A list of unique `SafetySetting` instances for blocking unsafe content. The API will block
     * any prompts and responses that fail to meet the thresholds set by these settings. If there
     * is no `SafetySetting` for a given `SafetyCategory` provided in the list, the API will use
     * the default safety setting for that category.
     */
    safetySettings?: SafetySetting[];
    /**
     * Google API key to use
     */
    apiKey?: string;
    /**
     * Google API version to use
     */
    apiVersion?: string;
    /**
     * Google API base URL to use
     */
    baseUrl?: string;
    /** Whether to stream the results or not */
    streaming?: boolean;
}
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
export declare class ChatGoogleGenerativeAI extends BaseChatModel<GoogleGenerativeAIChatCallOptions, AIMessageChunk> implements GoogleGenerativeAIChatInput {
    static lc_name(): string;
    lc_serializable: boolean;
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    modelName: string;
    model: string;
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    stopSequences: string[];
    safetySettings?: SafetySetting[];
    apiKey?: string;
    streaming: boolean;
    streamUsage: boolean;
    private client;
    get _isMultimodalModel(): boolean;
    constructor(fields?: GoogleGenerativeAIChatInput);
    getLsParams(options: this["ParsedCallOptions"]): LangSmithParams;
    _combineLLMOutput(): never[];
    _llmType(): string;
    bindTools(tools: (StructuredToolInterface | Record<string, unknown> | ToolDefinition | RunnableToolLike)[], kwargs?: Partial<GoogleGenerativeAIChatCallOptions>): Runnable<BaseLanguageModelInput, AIMessageChunk, GoogleGenerativeAIChatCallOptions>;
    invocationParams(options?: this["ParsedCallOptions"]): Omit<GenerateContentRequest, "contents">;
    _generate(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
    _streamResponseChunks(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
    completionWithRetry(request: string | GenerateContentRequest | (string | GenerativeAIPart)[], options?: this["ParsedCallOptions"]): Promise<import("@google/generative-ai").GenerateContentResult>;
    withStructuredOutput<RunOutput extends Record<string, any> = Record<string, any>>(outputSchema: z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<false>): Runnable<BaseLanguageModelInput, RunOutput>;
    withStructuredOutput<RunOutput extends Record<string, any> = Record<string, any>>(outputSchema: z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<true>): Runnable<BaseLanguageModelInput, {
        raw: BaseMessage;
        parsed: RunOutput;
    }>;
}
