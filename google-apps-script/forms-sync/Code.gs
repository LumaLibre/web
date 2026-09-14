const CACHE_SECONDS = 300;
const CATALOG_MAX_AGE_MS = 3 * 60 * 1000;
const CATALOG_CACHE_KEY = "forms-list-v6";
const CATALOG_PROPERTY_KEY = "forms-list-v6-snapshot";
const FORM_MAX_AGE_MS = 3 * 60 * 1000;
const FORM_CACHE_KEY_PREFIX = "form-v6-";
const FORM_PROPERTY_KEY_PREFIX = "form-v6-snapshot-";

function doGet(event) {
  try {
    const parameters = event && event.parameter || {};
    const action = parameters.action || "list";
    if (action === "list") {
      const pageSize = clampNumber_(parameters.pageSize, 1, 12, 3);
      const page = Math.max(0, parseInt(parameters.page || "0", 10) || 0);
      const forms = listForms_();
      const totalPages = Math.max(1, Math.ceil(forms.length / pageSize));
      const safePage = Math.min(page, totalPages - 1);
      const start = safePage * pageSize;
      return output_({
        ok: true,
        forms: forms.slice(start, start + pageSize),
        page: safePage,
        pageSize: pageSize,
        total: forms.length,
        totalPages: totalPages,
      }, event);
    }
    if (action === "form") {
      const id = String(parameters.id || "").trim();
      if (!id) throw new Error("A form ID is required.");
      return output_({ok: true, form: getForm_(id)}, event);
    }
    if (action === "refresh") {
      const id = String(parameters.id || "").trim();
      return output_({ok: true, refreshed: refreshServerCacheIfStale_(id)}, event);
    }
    throw new Error("Unknown action.");
  } catch (error) {
    return output_({ok: false, error: String(error && error.message || error)}, event);
  }
}

function listForms_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CATALOG_CACHE_KEY);
  const cachedSnapshot = parseCatalogSnapshot_(cached);
  if (isFreshCatalogSnapshot_(cachedSnapshot)) return cachedSnapshot.forms;

  const persistedSnapshot = readCatalogSnapshot_();
  if (persistedSnapshot) {
    cacheCatalogSnapshot_(persistedSnapshot);
    return persistedSnapshot.forms;
  }

  return refreshFormsCatalogIfStale_(persistedSnapshot || cachedSnapshot);
}

function refreshFormsCatalog() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return rebuildFormsCatalog_();
  } finally {
    lock.releaseLock();
  }
}

function refreshFormsCatalogIfStale_(staleSnapshot) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1500)) return staleSnapshot ? staleSnapshot.forms : [];

  try {
    // Another request may have refreshed the catalog while this request waited.
    const latestSnapshot = readCatalogSnapshot_();
    if (isFreshCatalogSnapshot_(latestSnapshot)) {
      cacheCatalogSnapshot_(latestSnapshot);
      return latestSnapshot.forms;
    }
    return rebuildFormsCatalog_();
  } finally {
    lock.releaseLock();
  }
}

function rebuildFormsCatalog_() {
  const files = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
  const forms = [];
  while (files.hasNext()) {
    const file = files.next();
    try {
      const form = FormApp.openById(file.getId());
      const questionItems = form.getItems().filter(isQuestionItem_);
      const description = form.getDescription() || "";
      const responses = form.getResponses();
      const lastResponseAt = responses.reduce((latest, response) => {
        const timestamp = response.getTimestamp();
        return timestamp && (!latest || timestamp > latest) ? timestamp : latest;
      }, null);
      forms.push({
        id: file.getId(),
        title: form.getTitle() || file.getName(),
        eyebrow: "Luma form",
        description: description.split(/\n\s*\n/)[0].trim(),
        estimatedMinutes: Math.max(1, Math.ceil(questionItems.length * 0.55)),
        responderUrl: form.getPublishedUrl(),
        acceptingResponses: form.isAcceptingResponses(),
        closedMessage: form.getCustomClosedFormMessage() || "This form is not accepting responses right now.",
        questionCount: questionItems.length,
        lastResponseAt: lastResponseAt ? lastResponseAt.toISOString() : null,
        modifiedAt: file.getLastUpdated().toISOString(),
      });
    } catch (error) {
      console.warn("Could not read form " + file.getId() + ": " + error);
    }
  }

  forms.sort((a, b) => {
    if (a.acceptingResponses !== b.acceptingResponses) return a.acceptingResponses ? -1 : 1;
    if (a.lastResponseAt && b.lastResponseAt) return b.lastResponseAt.localeCompare(a.lastResponseAt);
    if (a.lastResponseAt) return -1;
    if (b.lastResponseAt) return 1;
    return b.modifiedAt.localeCompare(a.modifiedAt);
  });
  assignFormSlugs_(forms);
  saveCatalogSnapshot_(forms);
  return forms;
}

// shorter urls
function slugifyFormTitle_(title) {
  const slug = String(title || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug;
}

function shortFormId_(id) {
  return String(id || "").replace(/[^A-Za-z0-9]/g, "").slice(-6).toLowerCase() || "form";
}

function assignFormSlugs_(forms) {
  const counts = {};
  forms.forEach(form => {
    const base = slugifyFormTitle_(form.title) || "form-" + shortFormId_(form.id);
    form.slug = base;
    counts[base] = (counts[base] || 0) + 1;
  });
  forms.forEach(form => {
    if (counts[form.slug] > 1) form.slug += "-" + shortFormId_(form.id);
  });
}

function parseCatalogSnapshot_(serialized) {
  if (!serialized) return null;
  try {
    const parsed = JSON.parse(serialized);
    if (Array.isArray(parsed)) return {refreshedAt: 0, forms: parsed};
    if (parsed && Number.isFinite(parsed.refreshedAt) && Array.isArray(parsed.forms)) return parsed;
  } catch (error) {
    console.warn("Could not read the forms catalog snapshot: " + error);
  }
  return null;
}

function readCatalogSnapshot_() {
  return parseCatalogSnapshot_(PropertiesService.getScriptProperties().getProperty(CATALOG_PROPERTY_KEY));
}

function isFreshCatalogSnapshot_(snapshot) {
  return snapshot && Date.now() - snapshot.refreshedAt < CATALOG_MAX_AGE_MS;
}

function cacheCatalogSnapshot_(snapshot) {
  const serialized = JSON.stringify(snapshot);
  if (serialized.length < 95000) {
    CacheService.getScriptCache().put(CATALOG_CACHE_KEY, serialized, CACHE_SECONDS);
  }
}

function saveCatalogSnapshot_(forms) {
  const snapshot = {refreshedAt: Date.now(), forms: forms};
  const serialized = JSON.stringify(snapshot);
  cacheCatalogSnapshot_(snapshot);
  if (serialized.length < 8500) {
    PropertiesService.getScriptProperties().setProperty(CATALOG_PROPERTY_KEY, serialized);
  }
}

function clampNumber_(value, min, max, fallback) {
  const parsed = parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function getForm_(id, forceRefresh) {
  const cache = CacheService.getScriptCache();
  const cacheKey = FORM_CACHE_KEY_PREFIX + id;
  const cached = forceRefresh ? null : cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const snapshotKey = FORM_PROPERTY_KEY_PREFIX + id;
  const persistedForm = parseFormSnapshot_(PropertiesService.getScriptProperties().getProperty(snapshotKey));
  if (persistedForm && !forceRefresh) {
    const serializedForm = JSON.stringify(persistedForm.form);
    if (serializedForm.length < 95000) cache.put(cacheKey, serializedForm, CACHE_SECONDS);
    return persistedForm.form;
  }

  const file = DriveApp.getFileById(id);

  const form = FormApp.openById(id);
  const questionItems = form.getItems().filter(isQuestionItem_);
  const questionShape = questionItems.map(item => serializeQuestion_(null, item, ""));
  const signature = JSON.stringify(questionShape);
  const propertyKey = "form-questions-v5-" + id;
  const persisted = PropertiesService.getScriptProperties().getProperty(propertyKey);
  let questions;

  if (persisted) {
    try {
      const stored = JSON.parse(persisted);
      if (stored.signature === signature && Array.isArray(stored.questions)) questions = stored.questions;
    } catch (error) {
      console.warn("Could not read cached question mapping for " + id + ": " + error);
    }
  }

  if (!questions) {
    questions = questionItems.map(item => serializeQuestion_(form, item));
    const serializedQuestions = JSON.stringify({signature: signature, questions: questions});
    if (serializedQuestions.length < 8500) {
      PropertiesService.getScriptProperties().setProperty(propertyKey, serializedQuestions);
    }
  }

  const nativeOnly = questions.some(question => question.type === "unsupported" || !question.entryId);
  const result = {
    id: id,
    title: form.getTitle() || file.getName(),
    eyebrow: "Luma form",
    description: form.getDescription() || "",
    estimatedMinutes: Math.max(1, Math.ceil(questions.length * 0.55)),
    responderUrl: form.getPublishedUrl(),
    acceptingResponses: form.isAcceptingResponses(),
    closedMessage: form.getCustomClosedFormMessage() || "This form is not accepting responses right now.",
    successTitle: "Response received.",
    successMessage: form.getConfirmationMessage() || "Thanks for taking the time to respond.",
    nativeOnly: nativeOnly,
    questions: questions,
  };

  const serialized = JSON.stringify(result);
  if (serialized.length < 95000) cache.put(cacheKey, serialized, CACHE_SECONDS);
  const snapshot = JSON.stringify({refreshedAt: Date.now(), form: result});
  if (snapshot.length < 8500) {
    PropertiesService.getScriptProperties().setProperty(snapshotKey, snapshot);
  }
  return result;
}

function parseFormSnapshot_(serialized) {
  if (!serialized) return null;
  try {
    const parsed = JSON.parse(serialized);
    if (parsed && Number.isFinite(parsed.refreshedAt) && Array.isArray(parsed.form && parsed.form.questions)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Could not read the form snapshot: " + error);
  }
  return null;
}

function refreshServerCacheIfStale_(id) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(250)) return false;

  try {
    if (id) {
      const snapshotKey = FORM_PROPERTY_KEY_PREFIX + id;
      const snapshot = parseFormSnapshot_(PropertiesService.getScriptProperties().getProperty(snapshotKey));
      if (snapshot && Date.now() - snapshot.refreshedAt < FORM_MAX_AGE_MS) return false;
      getForm_(id, true);
      return true;
    }

    const catalog = readCatalogSnapshot_();
    const catalogIsFresh = isFreshCatalogSnapshot_(catalog);
    const forms = catalogIsFresh ? catalog.forms : rebuildFormsCatalog_();
    let refreshed = !catalogIsFresh;

    forms.filter(form => form.acceptingResponses).forEach(form => {
      const snapshotKey = FORM_PROPERTY_KEY_PREFIX + form.id;
      const snapshot = parseFormSnapshot_(PropertiesService.getScriptProperties().getProperty(snapshotKey));
      if (!snapshot || Date.now() - snapshot.refreshedAt >= FORM_MAX_AGE_MS) {
        getForm_(form.id, true);
        refreshed = true;
      }
    });
    return refreshed;
  } finally {
    lock.releaseLock();
  }
}

function serializeQuestion_(form, item, knownEntryId) {
  const base = {
    id: String(item.getId()),
    entryId: knownEntryId === undefined ? entryIdFor_(form, item) : knownEntryId,
    prompt: item.getTitle() || "Untitled question",
    description: item.getHelpText() || "",
    required: isRequired_(item),
  };

  // Rating items were added after several Apps Script FormApp runtimes. In
  // those runtimes the type name is available even when ItemType.RATING is not.
  if (String(item.getType()) === "RATING") {
    const rating = item.asRatingItem();
    return Object.assign(base, {
      type: "rating",
      scaleMin: 1,
      scaleMax: rating.getRatingScaleLevel(),
    });
  }

  switch (item.getType()) {
    case FormApp.ItemType.TEXT:
      return Object.assign(base, {type: "short_text", placeholder: "Your answer"});
    case FormApp.ItemType.PARAGRAPH_TEXT:
      return Object.assign(base, {type: "long_text", placeholder: "Your answer"});
    case FormApp.ItemType.MULTIPLE_CHOICE:
      return Object.assign(base, {type: "single_choice", options: choices_(item.asMultipleChoiceItem())});
    case FormApp.ItemType.CHECKBOX:
      return Object.assign(base, {type: "multi_choice", options: choices_(item.asCheckboxItem())});
    case FormApp.ItemType.LIST:
      return Object.assign(base, {type: "select", placeholder: "Choose an option", options: choices_(item.asListItem())});
    case FormApp.ItemType.SCALE:
      const scale = item.asScaleItem();
      return Object.assign(base, {
        type: "rating",
        scaleMin: scale.getLowerBound(),
        scaleMax: scale.getUpperBound(),
        minLabel: scale.getLeftLabel(),
        maxLabel: scale.getRightLabel(),
      });
    case FormApp.ItemType.RATING:
      const rating = item.asRatingItem();
      return Object.assign(base, {
        type: "rating",
        scaleMin: 1,
        scaleMax: rating.getRatingScaleLevel(),
      });
    default:
      return Object.assign(base, {type: "unsupported"});
  }
}

function choices_(item) {
  return item.getChoices().map(choice => ({label: choice.getValue(), value: choice.getValue()}));
}

function isQuestionItem_(item) {
  const type = item.getType();
  return type !== FormApp.ItemType.IMAGE
    && type !== FormApp.ItemType.VIDEO
    && type !== FormApp.ItemType.PAGE_BREAK
    && type !== FormApp.ItemType.SECTION_HEADER;
}

function isRequired_(item) {
  try {
    if (String(item.getType()) === "RATING") return item.asRatingItem().isRequired();
    switch (item.getType()) {
      case FormApp.ItemType.TEXT: return item.asTextItem().isRequired();
      case FormApp.ItemType.PARAGRAPH_TEXT: return item.asParagraphTextItem().isRequired();
      case FormApp.ItemType.MULTIPLE_CHOICE: return item.asMultipleChoiceItem().isRequired();
      case FormApp.ItemType.CHECKBOX: return item.asCheckboxItem().isRequired();
      case FormApp.ItemType.LIST: return item.asListItem().isRequired();
      case FormApp.ItemType.SCALE: return item.asScaleItem().isRequired();
      case FormApp.ItemType.RATING: return item.asRatingItem().isRequired();
      default: return false;
    }
  } catch (error) {
    return false;
  }
}

function entryIdFor_(form, item) {
  try {
    let itemResponse;
    if (String(item.getType()) === "RATING") {
      itemResponse = item.asRatingItem().createResponse(1);
    } else {
      switch (item.getType()) {
        case FormApp.ItemType.TEXT:
          itemResponse = item.asTextItem().createResponse("__LUMA_FIELD__");
          break;
        case FormApp.ItemType.PARAGRAPH_TEXT:
          itemResponse = item.asParagraphTextItem().createResponse("__LUMA_FIELD__");
          break;
        case FormApp.ItemType.MULTIPLE_CHOICE:
          itemResponse = item.asMultipleChoiceItem().createResponse(item.asMultipleChoiceItem().getChoices()[0].getValue());
          break;
        case FormApp.ItemType.CHECKBOX:
          itemResponse = item.asCheckboxItem().createResponse([item.asCheckboxItem().getChoices()[0].getValue()]);
          break;
        case FormApp.ItemType.LIST:
          itemResponse = item.asListItem().createResponse(item.asListItem().getChoices()[0].getValue());
          break;
        case FormApp.ItemType.SCALE:
          itemResponse = item.asScaleItem().createResponse(item.asScaleItem().getLowerBound());
          break;
        case FormApp.ItemType.RATING:
          itemResponse = item.asRatingItem().createResponse(1);
          break;
        default:
          return "";
      }
    }

    const url = form.createResponse().withItemResponse(itemResponse).toPrefilledUrl();
    const match = url.match(/[?&]entry\.(\d+)=/);
    return match ? match[1] : "";
  } catch (error) {
    return "";
  }
}

function output_(payload, event) {
  const json = JSON.stringify(payload);
  const callback = event && event.parameter && String(event.parameter.callback || "");
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
