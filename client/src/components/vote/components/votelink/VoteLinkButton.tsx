import React from "react";
import styles from "./VoteLinkButton.module.scss";

interface VoteLinkButtonProps {
    href: string;
    label: string;
    color?: string; // Optional color
}

const VoteLinkButton: React.FC<VoteLinkButtonProps> = ({ href, label, color }) => {
    return (
        <a
            className={styles.button}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: color }}
        >
            {label}
        </a>
    );
};

export default VoteLinkButton;
