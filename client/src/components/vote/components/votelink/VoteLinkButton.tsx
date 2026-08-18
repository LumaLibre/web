import React from "react";
import styles from "./VoteLinkButton.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faCheck} from "@fortawesome/free-solid-svg-icons";

interface VoteLinkButtonProps {
    href: string;
    label: string;
    index: number;
    opened: boolean;
    onOpen: () => void;
}

const VoteLinkButton: React.FC<VoteLinkButtonProps> = ({href, label, index, opened, onOpen}) => {
    return (
        <a
            className={`${styles.button} ${opened ? styles.opened : ''}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpen}
        >
            <span className={styles.index}>{String(index).padStart(2, '0')}</span>
            <span className={styles.label}>{label}</span>
            <span className={styles.action}>
                {opened ? '' : 'Vote'}
                <FontAwesomeIcon icon={opened ? faCheck : faArrowUpRightFromSquare}/>
            </span>
        </a>
    );
};

export default VoteLinkButton;
