import {MINOTAR_API} from "@/constants.ts";
import {JSX} from "react";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import emoji from "emoji-dictionary";

export class NewsPostContainer {

    private static MAX_CHARACTERS_POSTCARD_LINE: number = 30;
    private static MAX_POSTCARD_LINES: number = 7;

    id: string;
    title: string;
    thumbnail: string;
    author: string;
    timestamp: number;
    content: string;

    constructor(id: string, title: string, thumbnail: string, author: string, timestamp: number, content: string) {
        this.id = id;
        this.title = title;
        this.thumbnail = thumbnail;
        this.author = author;
        this.timestamp = timestamp;
        this.content = content;
    }

    getAuthorAvatarURL(): string {
        return `${MINOTAR_API}helm/${this.author}`;
    }

    getAuthorAvatar(): JSX.Element {
        return <img src={this.getAuthorAvatarURL()} alt={this.author} />;
    }

    getAuthorAvatarURLWithSize(size: number): string {
        return `${MINOTAR_API}helm/${this.author}/${size}`;
    }

    getAuthorAvatarWithSize(size: number): JSX.Element {
        return <img src={this.getAuthorAvatarURLWithSize(size)} alt={this.author} />;
    }

    formatTimestampWithOrdinal(): string {
        const date = new Date(this.timestamp);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        // Function to add ordinal suffix to the day
        const getOrdinalSuffix = (day: number) => {
            if (day > 3 && day < 21) return 'th'; // Special case for numbers 11-13
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
    }

    // Returns a short version of the timestamp (e.g., 1/17, 2/20, 3/5, etc.)
    formatTimestampShort(): string {
        const date = new Date(this.timestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    renderContent(): JSX.Element {
        const markdownWithBreaks = this.content
            .replace(/\n/g, '  \n')
            .replace(/:\w+:/g, (match) => emoji.getUnicode(match) || match);
        return <ReactMarkdown>{markdownWithBreaks}</ReactMarkdown>;
    }

    renderContentSmall(): JSX.Element {
        return this.renderContentTiny(NewsPostContainer.MAX_CHARACTERS_POSTCARD_LINE, NewsPostContainer.MAX_POSTCARD_LINES);
    }

    renderContentTiny(maxCharactersPerLine: number, maxLines: number): JSX.Element {
        let newContent = this.content
            .replace(/\n+/g, ' ')
            .replace(/\*/g, '')
            .replace(/#/g, '')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Remove link but keep text
            .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '$1'); // Remove image but keep alt text

        const lines: string[] = [];
        let currentLine = '';
        let builtWord = '';

        for (const character of newContent) {
            if (lines.length >= maxLines) {
                lines[maxLines - 1] += '...';
                break;
            }

            if (currentLine.length >= maxCharactersPerLine) {
                if (!currentLine.includes(' ') || currentLine.endsWith(' ')) {
                    lines.push(currentLine);
                    currentLine = '';
                }

                for (const localChar of currentLine.split('').reverse()) {
                    if (localChar === ' ') break;
                    builtWord += localChar;
                }

                builtWord = builtWord.split('').reverse().join('');
                currentLine = currentLine.substring(0, currentLine.length - builtWord.length);
                lines.push(currentLine);
            }

            if (builtWord.length > 0) {
                currentLine = builtWord;
                builtWord = '';
            }
            currentLine += character;
        }

        const done = lines.join('');

        const markdownWithBreaks = done
            .replace(/\n/g, '  \n')
            .replace(/:\w+:/g, (match) => emoji.getUnicode(match) || match);

        return <ReactMarkdown>{markdownWithBreaks}</ReactMarkdown>;
    }


}