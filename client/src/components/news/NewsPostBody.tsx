import ReactMarkdown from "react-markdown";
// @ts-expect-error emoji-dictionary does not ship TypeScript declarations.
import emoji from "emoji-dictionary";

function NewsPostBody({content}: { content: string }) {
    const markdownWithBreaks = content
        .replace(/\n/g, "  \n")
        .replace(/:\w+:/g, match => emoji.getUnicode(match) || match);

    return <ReactMarkdown>{markdownWithBreaks}</ReactMarkdown>;
}

export default NewsPostBody;
