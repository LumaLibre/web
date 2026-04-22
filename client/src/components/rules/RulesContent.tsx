import {useState, useRef, useEffect} from "react";
import styles from "./RulesContent.module.scss";
import judgeLuma from "@/assets/lumas/JudgeLuma.webp";
import gavel from "@/assets/Gavel.webp"
import Label from "@/components/label/Label.tsx";
import OverviewRules from "@/components/rules/components/OverviewRules.tsx";
import ConductRules from "@/components/rules/components/ConductRules.tsx";
import StoreRules from "@/components/rules/components/StoreRules.tsx";
import GameplayRules from "@/components/rules/components/GameplayRules.tsx";
import PoliciesRules from "@/components/rules/components/PoliciesRules.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFlag, faComments, faStore, faGamepad, faClipboardList} from "@fortawesome/free-solid-svg-icons";


export const quickLink = (text: string, link: string) => {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer">{text}</a>
    );
};


// #/§/↗
const ANCHOR_CHARACTER = "✦";


export const AnchorHeading = ({
    id,
    children,
    level = 2,
}: {
    id: string;
    children: React.ReactNode;
    level?: 1 | 2 | 3;
}) => {
    const Tag = `h${level}` as "h1" | "h2" | "h3";

    const copyLink = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;

        history.pushState(null, "", `#${id}`);

        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // ignore
        }

        e.currentTarget.blur();
    };

    return (
        <Tag id={id} className={styles.anchorHeading}>
            {children}
            <button
                type="button"
                onClick={copyLink}
                className={styles.anchorLink}
                aria-label={`Copy link to ${id}`}
                title="Copy link to this section"
            >
                {ANCHOR_CHARACTER}
            </button>
        </Tag>
    );
};


const tabs = [
    {name: "Overview", component: <OverviewRules/>, icon: faFlag},
    {name: "Conduct", component: <ConductRules/>, icon: faComments},
    {name: "Store", component: <StoreRules/>, icon: faStore},
    {name: "Gameplay", component: <GameplayRules/>, icon: faGamepad},
    {name: "Policies", component: <PoliciesRules/>, icon: faClipboardList}
];

const hashToTab: Record<string, string> = {
    overview: "Overview",
    conduct: "Conduct",
    store: "Store",
    gameplay: "Gameplay",
    policies: "Policies",
};

function Rules() {
    const [activeTab, setActiveTab] = useState("Overview");
    const cardRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const applyHash = () => {
            const hash = window.location.hash.replace("#", "");
            if (!hash) return;

            const prefix = hash.split("-")[0];
            const target = hashToTab[prefix];
            if (target) setActiveTab(target);
        };

        applyHash();
        window.addEventListener("hashchange", applyHash);
        return () => window.removeEventListener("hashchange", applyHash);
    }, []);


    useEffect(() => {
        const hash = window.location.hash.replace("#", "");

        if (!hash) {
            if (cardRef.current) cardRef.current.scrollTop = 0;
            return;
        }


        const timer = setTimeout(() => {
            const el = document.getElementById(hash);
            if (el && cardRef.current) {

                const elTop = el.getBoundingClientRect().top;
                const cardTop = cardRef.current.getBoundingClientRect().top;
                cardRef.current.scrollTop += elTop - cardTop - 16;


                el.classList.add(styles.highlighted);
                window.setTimeout(() => el.classList.remove(styles.highlighted), 2000);
            } else if (cardRef.current) {
                cardRef.current.scrollTop = 0;
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [activeTab]);

    const handleTabClick = (name: string) => {
        setActiveTab(name);

        if (window.location.hash) {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        }
    };

    return (
        <div className={styles.rulesBackground}>
            <Label/>

            <img src={judgeLuma} alt="Judge Luma" className={styles.judgeLumaImg}/>
            <img src={gavel} alt="Luma Gavel" className={styles.gavelImg}/>

            <div className={styles.rulesCardSelector}>
                <div className={styles.rulesTextStyles}>
                    <h1 className={styles.rulesCardSelectorTitle}>
                        Rules
                    </h1>
                    {tabs.map((tab) => (
                        <a
                            className={styles.rulesCardSelectorNavItem}
                            key={tab.name}
                            onClick={() => handleTabClick(tab.name)}
                        >
                            <FontAwesomeIcon icon={tab.icon} className={styles.iconSmall}/>
                            <h2 className={styles.inlineText}>{tab.name}</h2>
                        </a>
                    ))}
                </div>
            </div>

            <div className={styles.rulesCard} ref={cardRef}>
                <div className={styles.rulesTextStyles}>
                    {tabs.map((tab) => (
                        <div
                            key={tab.name}
                            className={`${styles.rulesTransition} ${activeTab === tab.name ? styles.active : ""}`}
                        >
                            {activeTab === tab.name && tab.component}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Rules;