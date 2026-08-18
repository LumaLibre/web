import ReactMarkdown from "react-markdown";
import type {Components} from "react-markdown";
import {useState} from "react";
import styles from "./NewsPostBody.module.scss";
// @ts-expect-error emoji-dictionary does not ship TypeScript declarations.
import emoji from "emoji-dictionary";

const DISCORD_EMOJI_PATTERN = /<(a?):([\w-]+):(\d+)>/g;
const DISCORD_EMOJI_CDN = "https://cdn.discordapp.com/emojis/";

const MarkdownImage: NonNullable<Components["img"]> = ({node: _node, src, alt, ...props}) => {
    void _node;
    const [failed, setFailed] = useState(false);
    const isDiscordEmoji = typeof src === "string" && src.startsWith(DISCORD_EMOJI_CDN);

    if (isDiscordEmoji && failed) {
        return (
            <span className={styles.emojiFallback} role="img" aria-label={alt ?? "Custom emoji"}>
                ✨
            </span>
        );
    }

    return (
        <img
            {...props}
            src={src}
            alt={alt ?? ""}
            className={isDiscordEmoji ? styles.discordEmoji : props.className}
            onError={isDiscordEmoji ? () => setFailed(true) : props.onError}
        />
    );
};

function NewsPostBody({content}: { content: string }) {
    const markdownWithBreaks = content
        .replace(DISCORD_EMOJI_PATTERN, (_match, animated: string, name: string, id: string) => {
            const animation = animated === "a" ? "&animated=true" : "";
            return `![${name}](${DISCORD_EMOJI_CDN}${id}.webp?size=32${animation})`;
        })
        .replace(/\n/g, "  \n")
        .replace(/:\w+:/g, match => emoji.getUnicode(match) || match);

    return (
        <ReactMarkdown components={{img: MarkdownImage}}>
            {markdownWithBreaks}
        </ReactMarkdown>
    );
}

export default NewsPostBody;
