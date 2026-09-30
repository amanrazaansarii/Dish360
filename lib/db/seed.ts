import { randomUUID } from "node:crypto";
import type {
  AnalyticsEvent,
  Category,
  Database,
  Dish,
  DishModel,
  OpeningHours,
  Restaurant,
  Review,
  TableCode,
} from "@/lib/types";
import { hashPasswordSync } from "@/lib/auth/password";

/**
 * Sample content.
 *
 * The app ships with a filled-in café so every screen has something real on it
 * the first time it is opened, instead of a wall of empty states. The register
 * matches the landing page deliberately — an ordinary café, plain dish names,
 * rupee prices, and the same Smash Burger at ₹450 that the home page shows in
 * its QR card.
 *
 * Demo sign-in is printed in the README.
 */

const DEMO_EMAIL = "owner@copperleaf.test";
const DEMO_PASSWORD = "dish360demo";

function iso(daysAgo: number, hour = 13, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function caféHours(): OpeningHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: "08:00",
    close: day === 5 || day === 6 ? "23:00" : "22:30",
    closed: false,
  }));
}

function counterHours(): OpeningHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: "11:00",
    close: "22:00",
    closed: day === 1,
  }));
}

function model(
  dishId: string,
  options: { approved: boolean; vertices: number },
): DishModel {
  return {
    status: "ready",
    glbUrl: `/api/model/${dishId}/model.glb`,
    usdzUrl: `/api/model/${dishId}/model.usdz`,
    provider: "built-in",
    vertices: options.vertices,
    approved: options.approved,
    approvedAt: options.approved ? iso(5) : null,
    scale: 1,
    exposure: 1,
    shadowIntensity: 1,
    shadowSoftness: 0.8,
    autoRotate: true,
    environment: "warm",
    error: null,
    updatedAt: iso(6),
  };
}

function noModel(): DishModel {
  return {
    status: "none",
    glbUrl: null,
    usdzUrl: null,
    provider: null,
    vertices: null,
    approved: false,
    approvedAt: null,
    scale: 1,
    exposure: 1,
    shadowIntensity: 1,
    shadowSoftness: 0.8,
    autoRotate: true,
    environment: "warm",
    error: null,
    updatedAt: null,
  };
}

interface Spec {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number; // rupees
  calories: number | null;
  ingredients: string[];
  allergens: string[];
  dietTags: Dish["dietTags"];
  spice: Dish["spiceLevel"];
  prep: number;
  flavour: Dish["flavour"];
  rating: number;
  ratingCount: number;
  featured?: boolean;
  soldOut?: boolean;
  /** "live" = model built and approved · "waiting" = built, not approved yet · "none" */
  model?: "live" | "waiting" | "none";
  vertices?: number;
}

const COPPERLEAF: Spec[] = [
  {
    id: "dish-smash-burger",
    category: "cat-mains",
    name: "Smash Burger",
    description:
      "Two thin beef patties pressed on the griddle so the edges go crisp, cheddar, onions, house sauce, soft potato bun.",
    price: 450,
    calories: 680,
    ingredients: ["Beef patty", "Cheddar", "Onion", "House sauce", "Potato bun"],
    allergens: ["Wheat", "Milk", "Egg", "Mustard"],
    dietTags: [],
    spice: 0,
    prep: 14,
    flavour: { savoury: 92, sweet: 48, tang: 40, heat: 10 },
    rating: 4.8,
    ratingCount: 312,
    featured: true,
    model: "live",
    vertices: 14280,
  },
  {
    id: "dish-paneer-sandwich",
    category: "cat-mains",
    name: "Paneer Tikka Sandwich",
    description:
      "Paneer marinated overnight, grilled on the tandoor, mint chutney and onions in toasted sourdough.",
    price: 320,
    calories: 520,
    ingredients: ["Paneer", "Mint chutney", "Onion", "Sourdough", "Tandoori masala"],
    allergens: ["Wheat", "Milk"],
    dietTags: ["veg"],
    spice: 2,
    prep: 12,
    flavour: { savoury: 84, sweet: 30, tang: 58, heat: 52 },
    rating: 4.6,
    ratingCount: 188,
    featured: true,
    model: "live",
    vertices: 11640,
  },
  {
    id: "dish-butter-chicken",
    category: "cat-mains",
    name: "Butter Chicken with Rice",
    description:
      "Chicken thigh cooked in tomato and butter, finished with cream. Served with steamed basmati.",
    price: 480,
    calories: 740,
    ingredients: ["Chicken thigh", "Tomato", "Butter", "Cream", "Basmati rice"],
    allergens: ["Milk", "Cashew"],
    dietTags: ["halal", "gluten-free"],
    spice: 1,
    prep: 18,
    flavour: { savoury: 90, sweet: 62, tang: 54, heat: 30 },
    rating: 4.7,
    ratingCount: 264,
    model: "live",
    vertices: 10260,
  },
  {
    id: "dish-veg-biryani",
    category: "cat-mains",
    name: "Vegetable Biryani",
    description:
      "Long-grain rice layered with vegetables and whole spices, sealed and cooked slowly. Comes with raita.",
    price: 390,
    calories: 620,
    ingredients: ["Basmati rice", "Seasonal vegetables", "Saffron", "Fried onion", "Yoghurt"],
    allergens: ["Milk", "Cashew"],
    dietTags: ["veg"],
    spice: 2,
    prep: 22,
    flavour: { savoury: 82, sweet: 40, tang: 36, heat: 55 },
    rating: 4.5,
    ratingCount: 143,
    model: "live",
    vertices: 9820,
  },
  {
    id: "dish-masala-dosa",
    category: "cat-breakfast",
    name: "Masala Dosa",
    description:
      "Rice and lentil crêpe, crisp at the edges, with spiced potato inside. Sambar and two chutneys.",
    price: 220,
    calories: 410,
    ingredients: ["Rice batter", "Potato", "Curry leaf", "Mustard seed", "Coconut chutney"],
    allergens: [],
    dietTags: ["veg", "vegan", "gluten-free"],
    spice: 1,
    prep: 10,
    flavour: { savoury: 78, sweet: 26, tang: 48, heat: 34 },
    rating: 4.7,
    ratingCount: 201,
    model: "live",
    vertices: 8940,
  },
  {
    id: "dish-truffle-fries",
    category: "cat-small",
    name: "Truffle Fries",
    description:
      "Thin-cut fries tossed in truffle oil and parmesan, with a garlic mayo on the side.",
    price: 280,
    calories: 480,
    ingredients: ["Potato", "Truffle oil", "Parmesan", "Parsley", "Garlic mayo"],
    allergens: ["Milk", "Egg"],
    dietTags: ["veg"],
    spice: 0,
    prep: 8,
    flavour: { savoury: 88, sweet: 22, tang: 30, heat: 6 },
    rating: 4.6,
    ratingCount: 176,
    model: "live",
    vertices: 7860,
  },
  {
    id: "dish-chicken-momos",
    category: "cat-small",
    name: "Chicken Momos",
    description:
      "Eight steamed dumplings, minced chicken and spring onion, with a roasted chilli chutney.",
    price: 260,
    calories: 390,
    ingredients: ["Chicken mince", "Spring onion", "Ginger", "Wheat wrapper", "Red chilli"],
    allergens: ["Wheat", "Soy"],
    dietTags: ["halal"],
    spice: 2,
    prep: 14,
    flavour: { savoury: 86, sweet: 24, tang: 44, heat: 62 },
    rating: 4.4,
    ratingCount: 127,
    // Built, but the owner has not looked at it yet — this is what step 2 of the
    // landing page means by "You check every dish and approve it".
    model: "waiting",
    vertices: 8420,
  },
  {
    id: "dish-brownie",
    category: "cat-sweet",
    name: "Chocolate Brownie",
    description:
      "Dense, fudgy, slightly under-baked in the middle. Served warm with vanilla ice cream.",
    price: 240,
    calories: 520,
    ingredients: ["Dark chocolate", "Butter", "Egg", "Walnut", "Vanilla ice cream"],
    allergens: ["Wheat", "Milk", "Egg", "Walnut"],
    dietTags: ["veg", "egg"],
    spice: 0,
    prep: 6,
    flavour: { savoury: 30, sweet: 88, tang: 18, heat: 0 },
    rating: 4.8,
    ratingCount: 233,
    featured: true,
    model: "live",
    vertices: 7240,
  },
  {
    id: "dish-cheesecake",
    category: "cat-sweet",
    name: "Blueberry Cheesecake",
    description: "Baked cheesecake on a biscuit base, with a blueberry compote.",
    price: 320,
    calories: 460,
    ingredients: ["Cream cheese", "Digestive biscuit", "Blueberry", "Lemon zest"],
    allergens: ["Wheat", "Milk", "Egg"],
    dietTags: ["veg", "egg"],
    spice: 0,
    prep: 5,
    flavour: { savoury: 24, sweet: 84, tang: 66, heat: 0 },
    rating: 4.5,
    ratingCount: 118,
    model: "none",
  },
  {
    id: "dish-cold-coffee",
    category: "cat-drinks",
    name: "Cold Coffee",
    description: "Double shot, milk, a little sugar, blended till it has a head on it.",
    price: 220,
    calories: 280,
    ingredients: ["Espresso", "Milk", "Sugar", "Ice"],
    allergens: ["Milk"],
    dietTags: ["veg", "gluten-free"],
    spice: 0,
    prep: 4,
    flavour: { savoury: 34, sweet: 72, tang: 20, heat: 0 },
    rating: 4.6,
    ratingCount: 189,
    model: "live",
    vertices: 6120,
  },
  {
    id: "dish-mango-lassi",
    category: "cat-drinks",
    name: "Mango Lassi",
    description: "Alphonso pulp and thick curd, blended, served cold in a tall glass.",
    price: 190,
    calories: 240,
    ingredients: ["Alphonso mango", "Curd", "Sugar", "Cardamom"],
    allergens: ["Milk"],
    dietTags: ["veg", "gluten-free"],
    spice: 0,
    prep: 4,
    flavour: { savoury: 18, sweet: 86, tang: 52, heat: 0 },
    rating: 4.7,
    ratingCount: 154,
    soldOut: true,
    model: "none",
  },
];

const SAFFRON_STREET: Spec[] = [
  {
    id: "dish-vada-pav",
    category: "cat-ss-counter",
    name: "Vada Pav",
    description:
      "Spiced potato fritter in a soft pav with dry garlic chutney and a fried chilli.",
    price: 60,
    calories: 290,
    ingredients: ["Potato", "Gram flour", "Pav", "Garlic chutney", "Green chilli"],
    allergens: ["Wheat"],
    dietTags: ["veg", "vegan"],
    spice: 2,
    prep: 5,
    flavour: { savoury: 84, sweet: 18, tang: 34, heat: 68 },
    rating: 4.8,
    ratingCount: 96,
    featured: true,
    model: "live",
    vertices: 7480,
  },
  {
    id: "dish-pav-bhaji",
    category: "cat-ss-counter",
    name: "Pav Bhaji",
    description:
      "Mashed vegetables cooked down on the tawa with butter, served with two buttered pav.",
    price: 180,
    calories: 520,
    ingredients: ["Mixed vegetables", "Butter", "Pav", "Onion", "Lemon"],
    allergens: ["Wheat", "Milk"],
    dietTags: ["veg"],
    spice: 2,
    prep: 12,
    flavour: { savoury: 88, sweet: 34, tang: 58, heat: 60 },
    rating: 4.6,
    ratingCount: 74,
    featured: true,
    model: "live",
    vertices: 9160,
  },
  {
    id: "dish-falooda",
    category: "cat-ss-sweet",
    name: "Rose Falooda",
    description:
      "Rose syrup, vermicelli, basil seeds, milk and a scoop of kulfi on top.",
    price: 140,
    calories: 360,
    ingredients: ["Rose syrup", "Vermicelli", "Basil seed", "Milk", "Kulfi"],
    allergens: ["Milk", "Wheat", "Pistachio"],
    dietTags: ["veg"],
    spice: 0,
    prep: 6,
    flavour: { savoury: 16, sweet: 90, tang: 30, heat: 0 },
    rating: 4.5,
    ratingCount: 51,
    model: "none",
  },
];

function makeDish(spec: Spec, restaurantId: string, index: number): Dish {
  const built =
    spec.model === "live" || spec.model === "waiting"
      ? model(spec.id, {
          approved: spec.model === "live",
          vertices: spec.vertices ?? 9000,
        })
      : noModel();

  return {
    id: spec.id,
    restaurantId,
    categoryId: spec.category,
    name: spec.name,
    description: spec.description,
    priceMinor: spec.price * 100,
    currency: "INR",
    imageUrl: null,
    calories: spec.calories,
    ingredients: spec.ingredients,
    allergens: spec.allergens,
    dietTags: spec.dietTags,
    spiceLevel: spec.spice,
    prepMinutes: spec.prep,
    flavour: spec.flavour,
    rating: spec.rating,
    ratingCount: spec.ratingCount,
    soldOut: spec.soldOut ?? false,
    featured: spec.featured ?? false,
    published: true,
    sortIndex: index,
    model: built,
    createdAt: iso(60 - index),
    updatedAt: iso(4),
  };
}

export function buildSeed(): Database {
  const copperleafId = "rest-copperleaf";
  const saffronId = "rest-saffron";

  const restaurants: Restaurant[] = [
    {
      id: copperleafId,
      slug: "copperleaf",
      name: "Copperleaf Café",
      tagline: "Breakfast till close.",
      about:
        "A forty-seat café off Law College Road. We open at eight for coffee and keep the griddle on until the last table leaves. Most of what we serve is on the menu all day.",
      cuisine: ["Café", "All-day breakfast", "Indian"],
      city: "Pune",
      address: "12 Law College Road, Erandwane, Pune 411004",
      phone: "+91 20 4000 1360",
      website: "https://dish360.in",
      logoUrl: null,
      brandColor: "#aad0af",
      currency: "INR",
      plan: "pro",
      hours: caféHours(),
      published: true,
      createdAt: iso(120),
    },
    {
      id: saffronId,
      slug: "saffron-street",
      name: "Saffron Street",
      tagline: "Standing room only.",
      about:
        "A counter near Dadar station. Six things on the board, all of them ready in under ten minutes.",
      cuisine: ["Street food", "Maharashtrian"],
      city: "Mumbai",
      address: "Shop 4, Senapati Bapat Marg, Dadar West, Mumbai 400028",
      phone: "+91 22 4000 2360",
      logoUrl: null,
      website: "",
      brandColor: "#e8b64c",
      currency: "INR",
      plan: "free",
      hours: counterHours(),
      published: true,
      createdAt: iso(48),
    },
  ];

  const categories: Category[] = [
    {
      id: "cat-breakfast",
      restaurantId: copperleafId,
      name: "Breakfast",
      description: "Served all day. Nobody is going to stop you.",
      sortIndex: 0,
    },
    {
      id: "cat-small",
      restaurantId: copperleafId,
      name: "Small plates",
      description: "To share, or not.",
      sortIndex: 1,
    },
    {
      id: "cat-mains",
      restaurantId: copperleafId,
      name: "Mains",
      description: "",
      sortIndex: 2,
    },
    {
      id: "cat-sweet",
      restaurantId: copperleafId,
      name: "Sweet",
      description: "",
      sortIndex: 3,
    },
    {
      id: "cat-drinks",
      restaurantId: copperleafId,
      name: "Drinks",
      description: "",
      sortIndex: 4,
    },
    {
      id: "cat-ss-counter",
      restaurantId: saffronId,
      name: "At the counter",
      description: "",
      sortIndex: 0,
    },
    {
      id: "cat-ss-sweet",
      restaurantId: saffronId,
      name: "Something sweet",
      description: "",
      sortIndex: 1,
    },
  ];

  const dishes: Dish[] = [
    ...COPPERLEAF.map((spec, i) => makeDish(spec, copperleafId, i)),
    ...SAFFRON_STREET.map((spec, i) => makeDish(spec, saffronId, i)),
  ];

  const tableCodes: TableCode[] = [
    ...Array.from({ length: 10 }, (_, i): TableCode => {
      const table = String(i + 1).padStart(2, "0");
      return {
        id: `code-copperleaf-${table}`,
        restaurantId: copperleafId,
        code: `CPL-T${table}`,
        label: `Table ${table}`,
        target: "menu",
        targetDishId: null,
        tableNumber: table,
        scans: [186, 164, 141, 128, 112, 97, 84, 66, 51, 38][i],
        lastScanAt: iso(i % 3),
        active: true,
        createdAt: iso(90),
      };
    }),
    {
      id: "code-copperleaf-counter",
      restaurantId: copperleafId,
      code: "CPL-CTR",
      label: "Counter card",
      target: "menu",
      targetDishId: null,
      tableNumber: null,
      scans: 143,
      lastScanAt: iso(0, 19, 20),
      active: true,
      createdAt: iso(70),
    },
    {
      id: "code-copperleaf-burger",
      restaurantId: copperleafId,
      code: "CPL-BURGER",
      label: "Smash Burger card",
      target: "dish",
      targetDishId: "dish-smash-burger",
      tableNumber: null,
      scans: 219,
      lastScanAt: iso(0, 20, 5),
      active: true,
      createdAt: iso(55),
    },
    ...Array.from({ length: 3 }, (_, i): TableCode => {
      const table = String(i + 1).padStart(2, "0");
      return {
        id: `code-saffron-${table}`,
        restaurantId: saffronId,
        code: `SAF-T${table}`,
        label: `Ledge ${table}`,
        target: "menu",
        targetDishId: null,
        tableNumber: table,
        scans: [61, 44, 29][i],
        lastScanAt: iso(i + 1),
        active: true,
        createdAt: iso(40),
      };
    }),
  ];

  // Thirty days of plausible café traffic, so the analytics screen shows
  // something the owner could actually read a trend off.
  const events: AnalyticsEvent[] = [];
  const liveDishIds = COPPERLEAF.filter((s) => s.model === "live").map((s) => s.id);
  const tableCodesForCafe = tableCodes.filter(
    (c) => c.restaurantId === copperleafId && c.tableNumber,
  );

  let n = 0;
  const pick = <T,>(list: T[], offset: number): T =>
    list[(offset + n * 7) % list.length];

  for (let day = 29; day >= 0; day -= 1) {
    const weekday = new Date(Date.now() - day * 86400000).getDay();
    const weekend = weekday === 0 || weekday === 6 ? 1.7 : 1;
    const growth = 1 + (29 - day) * 0.022;
    const scans = Math.round(11 * weekend * growth);

    for (let s = 0; s < scans; s += 1) {
      n += 1;
      const code = pick(tableCodesForCafe, s);
      const dishId = pick(liveDishIds, s + 3);
      const device: AnalyticsEvent["device"] =
        n % 4 === 0 ? "android" : n % 11 === 0 ? "computer" : "iphone";
      const hour = 9 + (n % 12);

      const base = {
        restaurantId: copperleafId,
        tableCodeId: code.id,
        device,
        tableNumber: code.tableNumber,
      };

      events.push({
        id: randomUUID(),
        ...base,
        dishId: null,
        kind: "scan",
        seconds: null,
        createdAt: iso(day, hour, n % 60),
      });
      events.push({
        id: randomUUID(),
        ...base,
        dishId: null,
        kind: "menu_view",
        seconds: null,
        createdAt: iso(day, hour, (n + 1) % 60),
      });
      events.push({
        id: randomUUID(),
        ...base,
        dishId,
        kind: "dish_view",
        seconds: null,
        createdAt: iso(day, hour, (n + 4) % 60),
      });

      // Roughly two in three guests who open a dish go on to view it in 3D.
      if (n % 3 !== 0) {
        events.push({
          id: randomUUID(),
          ...base,
          dishId,
          kind: "ar_open",
          seconds: null,
          createdAt: iso(day, hour, (n + 7) % 60),
        });
        events.push({
          id: randomUUID(),
          ...base,
          dishId,
          kind: "ar_close",
          seconds: 12 + (n % 52),
          createdAt: iso(day, hour, (n + 8) % 60),
        });
      }

      if (n % 8 === 3) {
        events.push({
          id: randomUUID(),
          ...base,
          dishId,
          kind: "order",
          seconds: null,
          createdAt: iso(day, hour, (n + 11) % 60),
        });
      }
    }
  }

  const reviews: Review[] = [
    {
      id: randomUUID(),
      restaurantId: copperleafId,
      dishId: "dish-smash-burger",
      rating: 5,
      comment:
        "Seeing the size of it on the table before ordering settled an argument. We got two.",
      author: "Priya N.",
      createdAt: iso(3),
    },
    {
      id: randomUUID(),
      restaurantId: copperleafId,
      dishId: "dish-masala-dosa",
      rating: 5,
      comment: "Ordered this because of the 3D. It arrived looking exactly like it.",
      author: "Rahul K.",
      createdAt: iso(8),
    },
    {
      id: randomUUID(),
      restaurantId: copperleafId,
      dishId: "dish-paneer-sandwich",
      rating: 4,
      comment: "The allergen list saved me asking. Good sandwich.",
      author: "Fatima S.",
      createdAt: iso(11),
    },
  ];

  const orders: Database["orders"] = [
    {
      id: randomUUID(),
      restaurantId: copperleafId,
      tableNumber: "04",
      items: [
        { dishId: "dish-smash-burger", name: "Smash Burger", priceMinor: 45000, quantity: 2 },
        { dishId: "dish-truffle-fries", name: "Truffle Fries", priceMinor: 28000, quantity: 1 },
      ],
      totalMinor: 118000,
      currency: "INR",
      note: "One burger without onions please.",
      status: "new",
      createdAt: iso(0, 19, 42),
      updatedAt: iso(0, 19, 42),
    },
    {
      id: randomUUID(),
      restaurantId: copperleafId,
      tableNumber: "07",
      items: [
        { dishId: "dish-cold-coffee", name: "Cold Coffee", priceMinor: 22000, quantity: 2 },
        { dishId: "dish-brownie", name: "Chocolate Brownie", priceMinor: 24000, quantity: 1 },
      ],
      totalMinor: 68000,
      currency: "INR",
      note: "",
      status: "accepted",
      createdAt: iso(0, 19, 12),
      updatedAt: iso(0, 19, 18),
    },
    {
      id: randomUUID(),
      restaurantId: copperleafId,
      tableNumber: "02",
      items: [
        { dishId: "dish-butter-chicken", name: "Butter Chicken with Rice", priceMinor: 48000, quantity: 1 },
      ],
      totalMinor: 48000,
      currency: "INR",
      note: "",
      status: "served",
      createdAt: iso(1, 20, 30),
      updatedAt: iso(1, 20, 55),
    },
  ];

  return {
    version: 1,
    users: [
      {
        id: "user-copperleaf",
        email: DEMO_EMAIL,
        name: "Meera Joshi",
        passwordHash: hashPasswordSync(DEMO_PASSWORD),
        restaurantId: copperleafId,
        role: "owner",
        createdAt: iso(120),
      },
      {
        id: "user-saffron",
        email: "owner@saffronstreet.test",
        name: "Imran Shaikh",
        passwordHash: hashPasswordSync(DEMO_PASSWORD),
        restaurantId: saffronId,
        role: "owner",
        createdAt: iso(48),
      },
    ],
    sessions: [],
    restaurants,
    categories,
    dishes,
    tableCodes,
    events,
    orders,
    reviews,
    leads: [],
    outbox: [],
  };
}

export const DEMO_SIGN_IN = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
