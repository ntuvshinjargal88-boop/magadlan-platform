import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  uuid,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Organizations (hospitals / tenants) ----------
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  registerNumber: varchar("register_number", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  plan: varchar("plan", { length: 30 }).notNull().default("trial"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  criterionStatuses: many(orgCriterionStatus),
  documents: many(documents),
}));

// ---------- Users ----------
export const ROLES = [
  "SUPER_ADMIN", // platform owner (Tuvshinjargal)
  "ORG_ADMIN", // hospital admin
  "QUALITY_MANAGER", // магадлан/чанарын алба
  "STAFF",
] as const;
export type Role = (typeof ROLES)[number];

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 30 }).notNull().default("STAFF"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const usersRelations = relations(users, ({ one }) => ({
  org: one(organizations, { fields: [users.orgId], references: [organizations.id] }),
}));

// ---------- Criteria taxonomy (global, shared across all tenants) ----------
export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  title: text("title").notNull(),
  sourceOrder: text("source_order"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subChapters = pgTable("sub_chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  chapterId: uuid("chapter_id")
    .references(() => chapters.id, { onDelete: "cascade" })
    .notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const criteria = pgTable("criteria", {
  id: uuid("id").defaultRandom().primaryKey(),
  subChapterId: uuid("sub_chapter_id")
    .references(() => subChapters.id, { onDelete: "cascade" })
    .notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  requirement: text("requirement").notNull(),
  title: text("title").notNull(),
  scoreOptions: varchar("score_options", { length: 100 }).notNull().default("5,4,3,2,0"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const indicators = pgTable("indicators", {
  id: uuid("id").defaultRandom().primaryKey(),
  criterionId: uuid("criterion_id")
    .references(() => criteria.id, { onDelete: "cascade" })
    .notNull(),
  idx: integer("idx").notNull(),
  text: text("text").notNull(),
});

export const chaptersRelations = relations(chapters, ({ many }) => ({
  subChapters: many(subChapters),
}));
export const subChaptersRelations = relations(subChapters, ({ one, many }) => ({
  chapter: one(chapters, { fields: [subChapters.chapterId], references: [chapters.id] }),
  criteria: many(criteria),
}));
export const criteriaRelations = relations(criteria, ({ one, many }) => ({
  subChapter: one(subChapters, { fields: [criteria.subChapterId], references: [subChapters.id] }),
  indicators: many(indicators),
  statuses: many(orgCriterionStatus),
}));
export const indicatorsRelations = relations(indicators, ({ one }) => ({
  criterion: one(criteria, { fields: [indicators.criterionId], references: [criteria.id] }),
}));

// ---------- Per-organization compliance status ----------
export const STATUS_VALUES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLIANT",
  "NON_COMPLIANT",
  "NOT_APPLICABLE",
] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];

export const orgCriterionStatus = pgTable(
  "org_criterion_status",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    criterionId: uuid("criterion_id")
      .references(() => criteria.id, { onDelete: "cascade" })
      .notNull(),
    score: integer("score"),
    status: varchar("status", { length: 30 }).notNull().default("NOT_STARTED"),
    notes: text("notes"),
    updatedById: uuid("updated_by_id").references(() => users.id),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("org_criterion_unique").on(t.orgId, t.criterionId),
    index("org_criterion_org_idx").on(t.orgId),
  ]
);

export const orgCriterionStatusRelations = relations(orgCriterionStatus, ({ one }) => ({
  org: one(organizations, { fields: [orgCriterionStatus.orgId], references: [organizations.id] }),
  criterion: one(criteria, { fields: [orgCriterionStatus.criterionId], references: [criteria.id] }),
  updatedBy: one(users, { fields: [orgCriterionStatus.updatedById], references: [users.id] }),
}));

// ---------- Documents (тушаал/журам library) ----------
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    category: varchar("category", { length: 100 }).notNull().default("Бусад"),
    docNumber: varchar("doc_number", { length: 100 }),
    issueDate: varchar("issue_date", { length: 20 }),
    description: text("description"),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    filePath: text("file_path").notNull(),
    fileSize: integer("file_size").notNull().default(0),
    mimeType: varchar("mime_type", { length: 150 }),
    uploadedById: uuid("uploaded_by_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("documents_org_idx").on(t.orgId)]
);

export const documentsRelations = relations(documents, ({ one, many }) => ({
  org: one(organizations, { fields: [documents.orgId], references: [organizations.id] }),
  uploadedBy: one(users, { fields: [documents.uploadedById], references: [users.id] }),
  links: many(documentCriterionLinks),
}));

export const documentCriterionLinks = pgTable(
  "document_criterion_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .references(() => documents.id, { onDelete: "cascade" })
      .notNull(),
    criterionId: uuid("criterion_id")
      .references(() => criteria.id, { onDelete: "cascade" })
      .notNull(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("doc_criterion_unique").on(t.documentId, t.criterionId)]
);

export const documentCriterionLinksRelations = relations(documentCriterionLinks, ({ one }) => ({
  document: one(documents, { fields: [documentCriterionLinks.documentId], references: [documents.id] }),
  criterion: one(criteria, { fields: [documentCriterionLinks.criterionId], references: [criteria.id] }),
}));
