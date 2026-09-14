import {
    findGoogleFormByRoute,
    GoogleFormSummary,
    GoogleFormSurvey,
    ResolvedGoogleFormSurvey,
    resolveGoogleForm,
} from "@/scripts/googleForms.ts";

interface FormsListResponse {
    ok: boolean;
    forms?: GoogleFormSummary[];
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    error?: string;
}

interface FormDetailResponse {
    ok: boolean;
    form?: GoogleFormSurvey;
    error?: string;
}

// This endpoint exposes only the form catalog and question metadata intended for
// the public forms experience. It is not a Google credential or access token.
const endpoint = "https://script.google.com/macros/s/AKfycbwjQX5lN1T-zZtySOa8tNn6j_1vZaB0QIwICvg2sdzt0h3N0YZez6zQ4FB22GQYcbd1TA/exec";
const PAGE_CACHE_PREFIX = "luma-google-forms-page-v1";
const PAGE_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const CATALOG_BATCH_SIZE = 12;
const FORM_CACHE_PREFIX = "luma-google-form-v2";
const FORM_CACHE_MAX_AGE = 30 * 60 * 1000;
const pendingFormRequests = new Map<string, Promise<ResolvedGoogleFormSurvey | null>>();

export interface GoogleFormsPage {
    forms: GoogleFormSummary[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

interface CachedGoogleFormsPage {
    savedAt: number;
    data: GoogleFormsPage;
}

interface CachedGoogleForm {
    savedAt: number;
    data: ResolvedGoogleFormSurvey;
}

const validEndpoint = () => {
    if (!endpoint) return null;
    try {
        const url = new URL(endpoint);
        return url.protocol === "https:" && url.hostname === "script.google.com" && url.pathname.endsWith("/exec") ? url : null;
    } catch {
        return null;
    }
};

const jsonp = <T>(parameters: Record<string, string>): Promise<T> => {
    const baseUrl = validEndpoint();
    if (!baseUrl) return Promise.reject(new Error("Google Forms synchronization is not configured."));

    return new Promise<T>((resolve, reject) => {
        const callbackName = `lumaFormsCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const script = document.createElement("script");
        const timeout = window.setTimeout(() => cleanup(new Error("Google Forms synchronization timed out.")), 30000);

        const cleanup = (error?: Error, result?: T) => {
            window.clearTimeout(timeout);
            script.remove();
            delete (window as unknown as Record<string, unknown>)[callbackName];
            if (error) reject(error);
            else resolve(result as T);
        };

        (window as unknown as Record<string, unknown>)[callbackName] = (result: T) => cleanup(undefined, result);
        const url = new URL(baseUrl);
        Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
        url.searchParams.set("callback", callbackName);
        script.src = url.toString();
        script.async = true;
        // Fetch without Google account cookies. This prevents multi-account redirects and
        // ensures the public sync endpoint never receives a visitor's Google credentials.
        script.crossOrigin = "anonymous";
        script.referrerPolicy = "no-referrer";
        script.onerror = () => cleanup(new Error("Could not reach Google Forms synchronization."));
        document.head.appendChild(script);
    });
};

export const hasGoogleFormsSync = Boolean(validEndpoint());

const cacheKey = (page: number, pageSize: number) => `${PAGE_CACHE_PREFIX}:${page}:${pageSize}`;

export const getCachedGoogleFormsPage = (page: number, pageSize = 3): GoogleFormsPage | null => {
    try {
        const raw = window.localStorage.getItem(cacheKey(page, pageSize));
        if (!raw) return null;
        const cached = JSON.parse(raw) as CachedGoogleFormsPage;
        if (Date.now() - cached.savedAt > PAGE_CACHE_MAX_AGE || !Array.isArray(cached.data?.forms)) {
            window.localStorage.removeItem(cacheKey(page, pageSize));
            return null;
        }
        return cached.data;
    } catch {
        return null;
    }
};

const saveGoogleFormsPage = (data: GoogleFormsPage) => {
    try {
        window.localStorage.setItem(cacheKey(data.page, data.pageSize), JSON.stringify({savedAt: Date.now(), data}));
    } catch {
        // The catalog still works when browser storage is unavailable.
    }
};

export const fetchGoogleFormsPage = async (page: number, pageSize = 3): Promise<GoogleFormsPage> => {
    if (!hasGoogleFormsSync) throw new Error("Google Forms synchronization is not configured.");
    const response = await jsonp<FormsListResponse>({action: "list", page: String(page), pageSize: String(pageSize)});
    if (!response.ok || !response.forms) throw new Error(response.error || "Could not load Google Forms.");
    const data = {
        forms: response.forms,
        page: response.page ?? page,
        pageSize: response.pageSize ?? pageSize,
        total: response.total ?? response.forms.length,
        totalPages: response.totalPages ?? 1,
    };
    saveGoogleFormsPage(data);
    return data;
};

const sortGoogleFormsCatalog = (forms: GoogleFormSummary[]) => [...forms].sort((a, b) => {
    if (a.acceptingResponses !== b.acceptingResponses) return a.acceptingResponses ? -1 : 1;
    if (a.lastResponseAt && b.lastResponseAt) return b.lastResponseAt.localeCompare(a.lastResponseAt);
    if (a.lastResponseAt) return -1;
    if (b.lastResponseAt) return 1;
    return (b.modifiedAt ?? "").localeCompare(a.modifiedAt ?? "");
});

export const getCachedGoogleFormsCatalog = (): GoogleFormSummary[] | null => {
    const firstPage = getCachedGoogleFormsPage(0, CATALOG_BATCH_SIZE);
    if (!firstPage) return null;

    const pages = [firstPage];
    for (let page = 1; page < firstPage.totalPages; page += 1) {
        const cachedPage = getCachedGoogleFormsPage(page, CATALOG_BATCH_SIZE);
        if (!cachedPage) return null;
        pages.push(cachedPage);
    }

    return sortGoogleFormsCatalog(pages.flatMap((page) => page.forms));
};

export const fetchGoogleFormsCatalog = async (): Promise<GoogleFormSummary[]> => {
    if (!hasGoogleFormsSync) throw new Error("Google Forms synchronization is not configured.");

    const firstPage = await fetchGoogleFormsPage(0, CATALOG_BATCH_SIZE);
    const remainingPages = await Promise.all(
        Array.from(
            {length: Math.max(0, firstPage.totalPages - 1)},
            (_, index) => fetchGoogleFormsPage(index + 1, CATALOG_BATCH_SIZE),
        ),
    );
    const uniqueForms = new Map<string, GoogleFormSummary>();
    [firstPage, ...remainingPages].forEach((page) => {
        page.forms.forEach((form) => uniqueForms.set(form.id, form));
    });
    return sortGoogleFormsCatalog([...uniqueForms.values()]);
};

const formCacheKey = (id: string) => `${FORM_CACHE_PREFIX}:${id}`;

export const getCachedGoogleForm = (id: string): ResolvedGoogleFormSurvey | null => {
    try {
        const raw = window.localStorage.getItem(formCacheKey(id));
        if (!raw) return null;
        const cached = JSON.parse(raw) as CachedGoogleForm;
        if (Date.now() - cached.savedAt > FORM_CACHE_MAX_AGE || !Array.isArray(cached.data?.questions)) {
            window.localStorage.removeItem(formCacheKey(id));
            return null;
        }
        return resolveGoogleForm(cached.data);
    } catch {
        return null;
    }
};

export const getCachedGoogleFormByRoute = (routeKey: string): ResolvedGoogleFormSurvey | null => {
    const direct = getCachedGoogleForm(routeKey);
    if (direct) return direct;

    const catalog = getCachedGoogleFormsCatalog();
    const summary = catalog ? findGoogleFormByRoute(catalog, routeKey) : undefined;
    return summary ? getCachedGoogleForm(summary.id) : null;
};

const saveGoogleForm = (id: string, data: ResolvedGoogleFormSurvey) => {
    try {
        window.localStorage.setItem(formCacheKey(id), JSON.stringify({savedAt: Date.now(), data}));
    } catch {
        // The form still works when browser storage is unavailable.
    }
};

export const fetchGoogleForm = async (id: string): Promise<ResolvedGoogleFormSurvey | null> => {
    if (!hasGoogleFormsSync) throw new Error("Google Forms synchronization is not configured.");
    const existingRequest = pendingFormRequests.get(id);
    if (existingRequest) return existingRequest;

    const request = jsonp<FormDetailResponse>({action: "form", id})
        .then((response) => {
            if (!response.ok || !response.form) throw new Error(response.error || "Could not load this Google Form.");
            const resolved = resolveGoogleForm(response.form);
            saveGoogleForm(id, resolved);
            return resolved;
        })
        .finally(() => pendingFormRequests.delete(id));

    pendingFormRequests.set(id, request);
    return request;
};

export const fetchGoogleFormByRoute = async (routeKey: string): Promise<ResolvedGoogleFormSurvey | null> => {
    const cachedCatalog = getCachedGoogleFormsCatalog();
    let summary = cachedCatalog ? findGoogleFormByRoute(cachedCatalog, routeKey) : undefined;
    const looksLikeGoogleFormId = routeKey.length >= 40 && /^[A-Za-z0-9_-]+$/.test(routeKey);

    if (!summary && looksLikeGoogleFormId) return fetchGoogleForm(routeKey);

    if (!summary) {
        const catalog = await fetchGoogleFormsCatalog();
        summary = findGoogleFormByRoute(catalog, routeKey);
    }

    // Existing ID-based URLs remain valid even if the catalog is briefly stale.
    return fetchGoogleForm(summary?.id ?? routeKey);
};
