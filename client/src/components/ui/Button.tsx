import styles from "./Button.module.scss";
import React from "react";

type ButtonProps = {
    text: string;
    href?: string | null;
    onClick?: (() => void) | null;
    onMouseEnter?: (() => void) | null;
    onMouseLeave?: (() => void) | null;
    className?: string;
};

const Button = ({ text, href, onClick, onMouseEnter, onMouseLeave, className }: ButtonProps) => {
    const validHref = href || "#"; // Ensure href is never null
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) {
            e.preventDefault(); // Prevent navigation if `onClick` is defined
            onClick();
        }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onMouseEnter) {
            e.preventDefault();
            onMouseEnter();
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onMouseLeave) {
            e.preventDefault();
            onMouseLeave();
        }
    };

    return (
        <a
            className={`${styles.customButton} ${className ? className : ""}`}
            href={validHref}
            onClick={onClick ? handleClick : undefined} // Only attach if onClick is provided
            onMouseEnter={onMouseEnter ? handleMouseEnter : undefined}
            onMouseLeave={onMouseLeave ? handleMouseLeave : undefined}
        >
            <div className={styles.buttonBorder}></div>
            <div className={styles.buttonContent}>{text}</div>
        </a>
    );
};

export default Button;
