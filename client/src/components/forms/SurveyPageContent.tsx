import {
    CSSProperties,
    KeyboardEvent as ReactKeyboardEvent,
    PointerEvent as ReactPointerEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import {useParams} from "react-router-dom";
import {FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaCheck, FaCircleCheck, FaPaperPlane} from "react-icons/fa6";
import {setTitle} from "@/App.tsx";
import {
    createGoogleFormPayload,
    GoogleFormQuestion,
    inferGoogleFormKind,
    ResolvedGoogleFormSurvey,
} from "@/scripts/googleForms.ts";
import {
    fetchGoogleForm,
    fetchGoogleFormByRoute,
    getCachedGoogleFormByRoute,
    refreshGoogleFormsServerCache,
} from "@/scripts/googleFormsSync.ts";
import FormsLoadingScreen from "./FormsLoadingScreen.tsx";
import styles from "./SurveyPageContent.module.scss";

type Answer = string | string[] | number;
type Motion = "idle" | "exitLeft" | "exitRight" | "enterLeft" | "enterRight";

const hasAnswer = (answer: Answer | undefined) => {
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === "string") return answer.trim().length > 0;
    return typeof answer === "number" && Number.isFinite(answer);
};

const validateAnswer = (question: GoogleFormQuestion, answer: Answer | undefined): string | null => {
    if (!hasAnswer(answer)) return question.required ? "Choose or enter an answer to continue." : null;

    if (typeof answer === "string" && (question.type === "short_text" || question.type === "long_text")) {
        const length = answer.trim().length;
        if (question.minLength && length < question.minLength) return `Use at least ${question.minLength} characters.`;
        if (question.maxLength && length > question.maxLength) return `Keep this to ${question.maxLength} characters or fewer.`;
    }

    return null;
};

const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof Element
    && target.closest("button, input, textarea, select, a") !== null;

function QuestionInput({
    question,
    answer,
    onChange,
}: {
    question: GoogleFormQuestion;
    answer: Answer | undefined;
    onChange: (answer: Answer) => void;
}) {
    if (question.type === "unsupported") {
        return <p className={styles.unsupported}>This question type needs to be completed in Google Forms.</p>;
    }

    if (question.type === "short_text" || question.type === "long_text") {
        const shared = {
            value: typeof answer === "string" ? answer : "",
            placeholder: question.placeholder,
            maxLength: question.maxLength,
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
        };

        return question.type === "long_text"
            ? <textarea className={styles.textarea} rows={5} {...shared}/>
            : <input className={styles.textInput} type="text" {...shared}/>;
    }

    if (question.type === "select") {
        return (
            <select className={styles.select} value={typeof answer === "string" ? answer : ""} onChange={(event) => onChange(event.target.value)}>
                <option value="">{question.placeholder ?? "Choose an option"}</option>
                {question.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
        );
    }

    if (question.type === "rating") {
        const min = question.scaleMin ?? 1;
        const max = question.scaleMax ?? 5;
        const values = Array.from({length: max - min + 1}, (_, index) => min + index);

        return (
            <div className={styles.ratingWrap}>
                <div className={styles.rating}>
                    {values.map((value) => (
                        <button
                            key={value}
                            className={answer === value ? styles.ratingSelected : ""}
                            type="button"
                            aria-pressed={answer === value}
                            onClick={() => onChange(value)}
                        >
                            {value}
                        </button>
                    ))}
                </div>
                <div className={styles.scaleLabels}><span>{question.minLabel}</span><span>{question.maxLabel}</span></div>
            </div>
        );
    }

    const selectedValues = Array.isArray(answer) ? answer : [];
    const isMulti = question.type === "multi_choice";

    return (
        <div className={styles.options}>
            {question.options?.map((option, index) => {
                const selected = isMulti ? selectedValues.includes(option.value) : answer === option.value;
                const choose = () => {
                    if (!isMulti) return onChange(option.value);
                    onChange(selected
                        ? selectedValues.filter((value) => value !== option.value)
                        : [...selectedValues, option.value]);
                };

                return (
                    <button
                        key={option.value}
                        className={selected ? styles.optionSelected : ""}
                        type="button"
                        aria-pressed={selected}
                        onClick={choose}
                    >
                        <span className={isMulti ? styles.checkbox : styles.radio}>{selected && <FaCheck/>}</span>
                        <span>{option.label}</span>
                        <small>{String.fromCharCode(65 + index)}</small>
                    </button>
                );
            })}
        </div>
    );
}

function SurveyExperience({form}: {form: ResolvedGoogleFormSurvey}) {
    const [answers, setAnswers] = useState<Record<string, Answer>>({});
    const [hasStarted, setHasStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [motion, setMotion] = useState<Motion>("idle");
    const [dragX, setDragX] = useState(0);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const pointerStart = useRef<{id: number; x: number} | null>(null);
    const transitionTimer = useRef<number | null>(null);
    const question = form.questions[currentIndex];
    const progress = ((currentIndex + 1) / form.questions.length) * 100;

    useEffect(() => () => {
        if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    }, []);

    const updateAnswer = (answer: Answer) => {
        setAnswers((current) => ({...current, [question.id]: answer}));
        setError("");
    };

    const transitionTo = (nextIndex: number, direction: "next" | "back") => {
        if (motion !== "idle") return;
        setDragX(0);
        setMotion(direction === "next" ? "exitLeft" : "exitRight");
        transitionTimer.current = window.setTimeout(() => {
            setCurrentIndex(nextIndex);
            setError("");
            setMotion(direction === "next" ? "enterRight" : "enterLeft");
            window.requestAnimationFrame(() => window.requestAnimationFrame(() => setMotion("idle")));
        }, 190);
    };

    const submit = async () => {
        if (!form.acceptingResponses) {
            setError(form.closedMessage || "This form is no longer accepting responses.");
            return;
        }

        if (!form.isSubmissionConfigured || !form.responseUrl) {
            setError("Google Forms is not connected yet. Add the form URL and entry IDs before collecting responses.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        try {
            await fetch(form.responseUrl, {
                method: "POST",
                mode: "no-cors",
                body: createGoogleFormPayload(form, answers),
                keepalive: true,
            });
            setIsComplete(true);
        } catch {
            setError("We could not hand this response to Google Forms. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const next = () => {
        if (motion !== "idle" || isSubmitting) return;
        const validationError = validateAnswer(question, answers[question.id]);
        if (validationError) {
            setDragX(0);
            setError(validationError);
            return;
        }

        if (currentIndex === form.questions.length - 1) void submit();
        else transitionTo(currentIndex + 1, "next");
    };

    const back = () => {
        if (currentIndex > 0 && motion === "idle" && !isSubmitting) transitionTo(currentIndex - 1, "back");
        else setDragX(0);
    };

    const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        if (motion !== "idle" || isInteractiveTarget(event.target)) return;
        pointerStart.current = {id: event.pointerId, x: event.clientX};
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
        if (pointerStart.current?.id !== event.pointerId) return;
        setDragX(Math.max(-150, Math.min(150, event.clientX - pointerStart.current.x)));
    };

    const onPointerEnd = (event: ReactPointerEvent<HTMLElement>) => {
        if (pointerStart.current?.id !== event.pointerId) return;
        pointerStart.current = null;
        if (dragX < -72) next();
        else if (dragX > 72) back();
        else setDragX(0);
    };

    const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
        if (isInteractiveTarget(event.target)) {
            if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
                event.preventDefault();
                next();
            }
            return;
        }
        if (event.key === "ArrowLeft") back();
        if (event.key === "ArrowRight") next();
        if (event.key === "Enter") {
            event.preventDefault();
            next();
        }
    };

    if (isComplete) {
        return (
            <section className={styles.completeCard}>
                <span><FaCircleCheck/></span>
                <p className={styles.eyebrow}>Response sent</p>
                <h2>{form.successTitle}</h2>
                <p>{form.successMessage}</p>
                <a href="/forms">Back to Forms <FaArrowRight/></a>
            </section>
        );
    }

    if (!hasStarted) {
        return (
            <section className={styles.surveyStage} aria-label={`${form.title} introduction`}>
                <article className={`${styles.coverCard} ${!form.acceptingResponses ? styles.coverClosed : ""}`}>
                    {!form.acceptingResponses && <strong className={styles.closedStamp}>Closed</strong>}
                    <p className={styles.eyebrow}>Cover</p>
                    <h2>Let's go!</h2>
                    <p className={styles.coverDescription}>
                        You can go back to change an answer before sending your response.
                    </p>
                    {!form.acceptingResponses && (
                        <p className={styles.closedMessage}>{form.closedMessage || "This form is not accepting responses right now."}</p>
                    )}
                    <div className={styles.coverFooter}>
                        <span>{form.questions.length} questions · About {form.estimatedMinutes} minutes</span>
                        {form.nativeOnly && form.directUrl ? (
                            <a href={form.directUrl} target="_blank" rel="noreferrer">Open in Google Forms <FaArrowUpRightFromSquare/></a>
                        ) : (
                            <button type="button" onClick={() => setHasStarted(true)} disabled={!form.acceptingResponses}>
                                {form.acceptingResponses ? <>Start form <FaArrowRight/></> : "Responses closed"}
                            </button>
                        )}
                    </div>
                </article>
            </section>
        );
    }

    const cardStyle = motion === "idle" && dragX !== 0
        ? {transform: `translateX(${dragX}px) rotate(${dragX / 35}deg)`, opacity: 1 - Math.abs(dragX) / 350} as CSSProperties
        : undefined;

    return (
        <section className={styles.surveyStage} aria-label={`${form.title} questions`}>
            <div className={styles.progressRow}>
                <span>Question {currentIndex + 1} of {form.questions.length}</span>
                <strong>{Math.round(progress)}%</strong>
            </div>
            <div className={styles.progressTrack}><span style={{width: `${progress}%`}}/></div>

            <div className={styles.deck}>
                <div className={styles.backCardTwo}/>
                <div className={styles.backCardOne}/>
                <article
                    className={`${styles.questionCard} ${styles[motion]}`}
                    style={cardStyle}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerEnd}
                    onPointerCancel={onPointerEnd}
                >
                    <div className={styles.cardTopline}>
                        <span>{question.required ? "Required" : "Optional"}</span>
                        <small>Swipe to navigate</small>
                    </div>
                    <h2>{question.prompt}</h2>
                    {question.description && <p className={styles.questionDescription}>{question.description}</p>}

                    <div className={styles.answerArea}>
                        <QuestionInput question={question} answer={answers[question.id]} onChange={updateAnswer}/>
                    </div>

                    <div className={styles.cardFooter}>
                        <div className={styles.error} role="alert">{error}</div>
                        <div className={styles.actions}>
                            <button type="button" onClick={back} disabled={currentIndex === 0 || motion !== "idle"} aria-label="Previous question">
                                <FaArrowLeft/>
                            </button>
                            <button className={styles.nextButton} type="button" onClick={next} disabled={motion !== "idle" || isSubmitting}>
                                {currentIndex === form.questions.length - 1
                                    ? <>{isSubmitting ? "Sending…" : "Send response"} <FaPaperPlane/></>
                                    : <>Continue <FaArrowRight/></>}
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}

function SurveyPageContent() {
    const {surveyId: routeKey = ""} = useParams();
    const [form, setForm] = useState<ResolvedGoogleFormSurvey | null | undefined>(() => getCachedGoogleFormByRoute(routeKey) ?? undefined);
    const [loadError, setLoadError] = useState("");
    setTitle(form?.title ?? "Forms");

    useEffect(() => {
        let active = true;
        const cached = getCachedGoogleFormByRoute(routeKey);
        setForm(cached ?? undefined);
        setLoadError("");
        fetchGoogleFormByRoute(routeKey)
            .then((result) => {
                if (!active) return;
                setForm(result);
                if (result) {
                    void refreshGoogleFormsServerCache(result.id)
                        .then(() => fetchGoogleForm(result.id))
                        .then((refreshed) => {
                            if (active) setForm(refreshed);
                        })
                        .catch(() => undefined);
                }
            })
            .catch(() => {
                if (!active) return;
                if (cached) {
                    setLoadError("Live refresh is temporarily unavailable. Showing the most recent form saved on this device.");
                    return;
                }
                setForm(null);
                setLoadError("Live synchronization is temporarily unavailable.");
            });
        return () => { active = false; };
    }, [routeKey]);

    if (form === undefined) {
        return <FormsLoadingScreen embedded/>;
    }

    if (!form) {
        return (
            <main className={styles.page}>
                <section className={styles.messageCard}>
                    <p className={styles.eyebrow}>Form not found</p>
                    <h1>That form does not exist.</h1>
                    <p>Check the link or return to the LumaMC website.</p>
                    <a href="/"><FaArrowLeft/> Back to LumaMC</a>
                </section>
            </main>
        );
    }

    return (
        <main className={styles.page}>
                <div className={styles.layout}>
                    <aside className={styles.intro}>
                        <p className={styles.eyebrow}>{inferGoogleFormKind(form.title)}</p>
                        <h1>{form.title}</h1>
                        <p className={styles.description}>{form.description.split("\n")[0]}</p>
                        <div className={styles.meta}>
                            <span><FaCircleCheck/></span>
                            <div><strong>About {form.estimatedMinutes} minutes</strong><small>One question at a time</small></div>
                        </div>
                    </aside>

                    <SurveyExperience form={form}/>
                </div>
                {loadError && <p className={styles.loadWarning}>{loadError}</p>}
        </main>
    );
}

export default SurveyPageContent;
