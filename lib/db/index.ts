import * as local from "./local/repository";
import * as remote from "./remote/repository";
import { supabaseConfigured } from "./remote/client";

/**
 * Which store the app is talking to.
 *
 * Two complete backends behind one set of function signatures:
 *
 *   local   a JSON file under .data/, seeded on first use. Needs a writable
 *           disk, which a laptop has and a serverless host does not.
 *   remote  Supabase. What a deployment uses.
 *
 * Picked by environment rather than by a flag in code, so nothing above this
 * file knows the difference:
 *
 *   DATA_BACKEND=local | supabase   decides outright, if set
 *   otherwise                       Supabase when its keys are present, else local
 *
 * Deploying with neither configured is a mistake worth being loud about. That
 * refusal lives in `./guard` and fires on the first query rather than here, so
 * that `next build` — which also runs with NODE_ENV=production — still works on
 * a machine that has no keys.
 */

export type BackendName = "local" | "supabase";

function choose(): BackendName {
  const asked = process.env.DATA_BACKEND;

  if (asked === "local") return "local";
  if (asked === "supabase") return "supabase";

  return supabaseConfigured() ? "supabase" : "local";
}

/** Which backend is live. Shown on the Settings screen. */
export const backend: BackendName = choose();

const db = backend === "supabase" ? remote : local;

/* Users */
export const findUserByEmail = db.findUserByEmail;
export const findUserById = db.findUserById;
export const createUser = db.createUser;
export const updateUser = db.updateUser;

/* Sessions */
export const createSession = db.createSession;
export const findSession = db.findSession;
export const deleteSession = db.deleteSession;

/* Places */
export const listRestaurants = db.listRestaurants;
export const getRestaurant = db.getRestaurant;
export const getRestaurantBySlug = db.getRestaurantBySlug;
export const createRestaurant = db.createRestaurant;
export const updateRestaurant = db.updateRestaurant;
export const slugAvailable = db.slugAvailable;

/* Sections */
export const listCategories = db.listCategories;
export const createCategory = db.createCategory;
export const updateCategory = db.updateCategory;
export const deleteCategory = db.deleteCategory;
export const reorderCategories = db.reorderCategories;

/* Dishes */
export const listDishes = db.listDishes;
export const getDish = db.getDish;
export const listFeaturedDishes = db.listFeaturedDishes;
export const createDish = db.createDish;
export const updateDish = db.updateDish;
export const updateDishModel = db.updateDishModel;
export const setModelApproved = db.setModelApproved;
export const deleteDish = db.deleteDish;
export const reorderDishes = db.reorderDishes;

/* Table codes */
export const listTableCodes = db.listTableCodes;
export const getTableCode = db.getTableCode;
export const getTableCodeByCode = db.getTableCodeByCode;
export const createTableCode = db.createTableCode;
export const updateTableCode = db.updateTableCode;
export const deleteTableCode = db.deleteTableCode;
export const codeAvailable = db.codeAvailable;
export const recordScan = db.recordScan;

/* What guests did */
export const recordEvent = db.recordEvent;
export const listEvents = db.listEvents;

/* Orders */
export const listOrders = db.listOrders;
export const createOrder = db.createOrder;
export const updateOrderStatus = db.updateOrderStatus;

/* Reviews */
export const listReviews = db.listReviews;
export const createReview = db.createReview;

/* Leads */
export const createLead = db.createLead;
export const listLeads = db.listLeads;

/* Outbox */
export const queueMail = db.queueMail;
export const listOutbox = db.listOutbox;
