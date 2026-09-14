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
}

export interface GoogleFormSurvey {
    id: string;
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

// Some deployed Apps Script runtimes report Google's newer rating item as an
// unsupported question. Keep the known public field mapping here so an older
// sync response cannot force an otherwise compatible form back to Google.
const questionCompatibility: Record<string, Record<string, Partial<GoogleFormQuestion>>> = {
    "1d8sAVJ--CwP0b88zBB6u9YVA2sIPNnaSMvrfYzPYYLo": {
        "690152628": {
            entryId: "1548547223",
            type: "rating",
            scaleMin: 1,
            scaleMax: 5,
        },
    },
};

export const inferGoogleFormKind = (title: string): GoogleFormKind => {
    const normalizedTitle = title.toLowerCase();

    if (/\b(application|applications|apply|recruitment|recruiting)\b/.test(normalizedTitle)) return "Application";
    if (/\b(survey|surveys|feedback|poll|questionnaire|check[ -]?in)\b/.test(normalizedTitle)) return "Survey";
    return "Form";
};

export const resolveGoogleForm = (form: GoogleFormSurvey): ResolvedGoogleFormSurvey => {
    const compatibility = questionCompatibility[form.id];
    const questions = compatibility
        ? form.questions.map((question) => ({...question, ...compatibility[question.id]}))
        : form.questions;
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
    }

    payload.set("fvv", "1");
    payload.set("pageHistory", "0");
    return payload;
};
