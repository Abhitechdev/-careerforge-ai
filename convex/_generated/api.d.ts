/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as advisor from "../advisor.js";
import type * as advisorActions from "../advisorActions.js";
import type * as advisorHealth from "../advisorHealth.js";
import type * as analyses from "../analyses.js";
import type * as analytics from "../analytics.js";
import type * as analyzeAction from "../analyzeAction.js";
import type * as announcements from "../announcements.js";
import type * as applicationActions from "../applicationActions.js";
import type * as applications from "../applications.js";
import type * as cache from "../cache.js";
import type * as coverLetterActions from "../coverLetterActions.js";
import type * as coverLetters from "../coverLetters.js";
import type * as emails from "../emails.js";
import type * as feedback from "../feedback.js";
import type * as intelligence from "../intelligence.js";
import type * as interviewActions from "../interviewActions.js";
import type * as interviews from "../interviews.js";
import type * as jobMatchActions from "../jobMatchActions.js";
import type * as jobMatches from "../jobMatches.js";
import type * as jobSearch from "../jobSearch.js";
import type * as networking from "../networking.js";
import type * as onboarding from "../onboarding.js";
import type * as pdfExtractor from "../pdfExtractor.js";
import type * as queue from "../queue.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as resumes from "../resumes.js";
import type * as retry from "../retry.js";
import type * as security from "../security.js";
import type * as system from "../system.js";
import type * as test from "../test.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  advisor: typeof advisor;
  advisorActions: typeof advisorActions;
  advisorHealth: typeof advisorHealth;
  analyses: typeof analyses;
  analytics: typeof analytics;
  analyzeAction: typeof analyzeAction;
  announcements: typeof announcements;
  applicationActions: typeof applicationActions;
  applications: typeof applications;
  cache: typeof cache;
  coverLetterActions: typeof coverLetterActions;
  coverLetters: typeof coverLetters;
  emails: typeof emails;
  feedback: typeof feedback;
  intelligence: typeof intelligence;
  interviewActions: typeof interviewActions;
  interviews: typeof interviews;
  jobMatchActions: typeof jobMatchActions;
  jobMatches: typeof jobMatches;
  jobSearch: typeof jobSearch;
  networking: typeof networking;
  onboarding: typeof onboarding;
  pdfExtractor: typeof pdfExtractor;
  queue: typeof queue;
  rateLimiter: typeof rateLimiter;
  resumes: typeof resumes;
  retry: typeof retry;
  security: typeof security;
  system: typeof system;
  test: typeof test;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
