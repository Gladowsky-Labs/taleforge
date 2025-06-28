/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as characters from "../characters.js";
import type * as chat from "../chat.js";
import type * as chats from "../chats.js";
import type * as customUniverses from "../customUniverses.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as openai from "../openai.js";
import type * as seed from "../seed.js";
import type * as universes from "../universes.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  characters: typeof characters;
  chat: typeof chat;
  chats: typeof chats;
  customUniverses: typeof customUniverses;
  http: typeof http;
  messages: typeof messages;
  openai: typeof openai;
  seed: typeof seed;
  universes: typeof universes;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
