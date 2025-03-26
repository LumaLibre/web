import styles from "./Button.module.scss";
import React from "react";

type ButtonProps = {
    text: string | React.ReactNode;
    href?: string | null;
    newTab?: boolean | null;
    onClick?: (() => void) | null;
    onMouseEnter?: (() => void) | null;
    onMouseLeave?: (() => void) | null;
    className?: string;
    buttonBorderClassName?: string;
    buttonContentClassName?: string;
};

const Button = ({ text, href, newTab, onClick, onMouseEnter, onMouseLeave, className, buttonBorderClassName, buttonContentClassName }: ButtonProps) => {
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
            target={newTab ? "_blank" : undefined}
            onClick={onClick ? handleClick : undefined} // Only attach if onClick is provided
            onMouseEnter={onMouseEnter ? handleMouseEnter : undefined}
            onMouseLeave={onMouseLeave ? handleMouseLeave : undefined}
        >
            <div className={`${styles.buttonBorder} ${buttonBorderClassName ? buttonBorderClassName : ""}`}></div>
            <div className={`${styles.buttonContent} ${buttonContentClassName ? buttonContentClassName : ""}`}>{text}</div>
        </a>
    );
};

export default Button;
