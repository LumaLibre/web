export type GoogleQuestionType =
    | "short_text"
    | "long_text"
    | "single_choice"
    | "multi_choice"
    | "select"
    | "rating"
    | "unsupported";

export interface GoogleFormOption {
    label: string;
    value: string;
}

export interface GoogleFormQuestion {
    id: string;
    entryId: string;
    type: GoogleQuestionType;
    prompt: string;
    description?: string;
    required: boolean;
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
    scaleMin?: number;
    scaleMax?: number;
    minLabel?: string;
    maxLabel?: string;
    options?: GoogleFormOption[];
    allowOther?: boolean;
}

export interface GoogleFormSurvey {
    id: string;
    slug?: string;
    title: string;
    eyebrow: string;
    description: string;
    estimatedMinutes: number;
    responderUrl: string;
    acceptingResponses: boolean;
    closedMessage?: string;
    nativeOnly?: boolean;
    successTitle: string;
    successMessage: string;
    questions: GoogleFormQuestion[];
}

export interface ResolvedGoogleFormSurvey extends GoogleFormSurvey {
    directUrl: string | null;
    responseUrl: string | null;
    isSubmissionConfigured: boolean;
}

export interface GoogleFormSummary {
    id: string;
    slug?: string;
    title: string;
    eyebrow: string;
    description: string;
    estimatedMinutes: number;
    responderUrl: string;
    acceptingResponses: boolean;
    closedMessage?: string;
    questionCount: number;
    lastResponseAt?: string | null;
    modifiedAt?: string;
}

export type GoogleFormKind = "Application" | "Survey" | "Form";

type GoogleFormIdentity = Pick<GoogleFormSummary, "id" | "slug" | "title">;

const shortFormId = (id: string) => id.replace(/[^A-Za-z0-9]/g, "").slice(-6).toLowerCase() || "form";

export const slugifyGoogleFormTitle = (title: string) => title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

export const getGoogleFormSlug = (form: GoogleFormIdentity, catalog: GoogleFormIdentity[] = [form]) => {
    if (form.slug) return form.slug;
    const base = slugifyGoogleFormTitle(form.title) || `form-${shortFormId(form.id)}`;
    const hasDuplicate = catalog.some((candidate) => candidate.id !== form.id
        && (candidate.slug || slugifyGoogleFormTitle(candidate.title)) === base);
    return hasDuplicate ? `${base}-${shortFormId(form.id)}` : base;
};

export const getGoogleFormPath = (form: GoogleFormIdentity, catalog: GoogleFormIdentity[] = [form]) =>
    `/forms/${getGoogleFormSlug(form, catalog)}`;

export const findGoogleFormByRoute = <T extends GoogleFormIdentity>(catalog: T[], routeKey: string): T | undefined =>
    catalog.find((form) => form.id === routeKey || getGoogleFormSlug(form, catalog) === routeKey);

export const inferGoogleFormKind = (title: string): GoogleFormKind => {
    const normalizedTitle = title.toLowerCase();

    if (/\b(application|applications|apply|recruitment|recruiting)\b/.test(normalizedTitle)) return "Application";
    if (/\b(survey|surveys|feedback|poll|questionnaire|check[ -]?in)\b/.test(normalizedTitle)) return "Survey";
    return "Form";
};

export const resolveGoogleForm = (form: GoogleFormSurvey): ResolvedGoogleFormSurvey => {
    const questions = form.questions;
    const nativeOnly = questions.some((question) => question.type === "unsupported" || !question.entryId);
    const normalizedForm = {...form, eyebrow: inferGoogleFormKind(form.title), questions, nativeOnly};
    const responderUrl = form.responderUrl;
    if (!responderUrl) return {...normalizedForm, directUrl: null, responseUrl: null, isSubmissionConfigured: false};

    try {
        const direct = new URL(responderUrl);
        const isPublishedGoogleForm = direct.hostname === "docs.google.com"
            && direct.pathname.startsWith("/forms/")
            && direct.pathname.endsWith("/viewform");

        if (!isPublishedGoogleForm) return {...normalizedForm, directUrl: null, responseUrl: null, isSubmissionConfigured: false};

        direct.searchParams.delete("embedded");
        const response = new URL(direct);
        response.pathname = response.pathname.replace(/\/viewform$/, "/formResponse");
        response.search = "";

        return {
            ...normalizedForm,
            directUrl: direct.toString(),
            responseUrl: response.toString(),
            isSubmissionConfigured: !nativeOnly,
        };
    } catch {
        return {...normalizedForm, directUrl: null, responseUrl: null, isSubmissionConfigured: false};
    }
};

export const createGoogleFormPayload = (
    form: ResolvedGoogleFormSurvey,
    answers: Record<string, string | string[] | number>,
    otherAnswers: Record<string, string> = {},
): URLSearchParams => {
    const payload = new URLSearchParams();

    for (const question of form.questions) {
        const answer = answers[question.id];
        if (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0)) continue;

        const entryName = question.entryId.startsWith("entry.") ? question.entryId : `entry.${question.entryId}`;
        if (Array.isArray(answer)) {
            answer.forEach((value) => payload.append(entryName, value));
        } else {
            payload.append(entryName, String(answer));
        }

        const includesOther = answer === GOOGLE_FORMS_OTHER_OPTION
            || (Array.isArray(answer) && answer.includes(GOOGLE_FORMS_OTHER_OPTION));
        if (includesOther) {
            payload.set(`${entryName}.other_option_response`, otherAnswers[question.id]?.trim() ?? "");
        }
    }

    payload.set("fvv", "1");
    payload.set("pageHistory", "0");
    return payload;
};

export const GOOGLE_FORMS_OTHER_OPTION = "__other_option__";
