import styles from "@/components/rules/RulesContent.module.scss";


const ConductRules = () => {
    return (
        <>
            <h1 className={styles.rulesTitleText}>
                Conduct Guidelines
            </h1>
            <div className={styles.rulesBodyText}>
                <strong>
                    In our community, we emphasize the importance of respectful behavior towards both fellow players
                    and staff members. It is imperative to refrain from any form of rudeness or disrespect, including:
                </strong>
                <ul>
                    <li>Spreading rumors.</li>
                    <li>Disrespecting or slandering towns, nations, staff, or fellow players.</li>
                    <li>Use of offensive language or engagement in discussions on sensitive topics.</li>
                    <li>Excessive swearing directed towards another player.</li>
                    <li>Any manifestation of harassment.</li>
                    <li>Actions or content that can be considered inappropriate.</li>
                    <li>Engaging in any form of bullying.</li>
                    <li>Displaying racism, homophobia, or any other form of discrimination.</li>
                    <li>Sharing personal information of other players, such as real names, phone numbers, addresses,
                        etc.
                    </li>
                    <li>Creating offensive content, including skins, usernames, builds, items, messages, etc.</li>
                    <li>Any actions that can be interpreted as a threat.</li>
                </ul>
                <h2>Global Chat Guidelines</h2>
                <ul>
                    <li>Swearing is permitted, provided it is in moderation, without the intent to hurt someone, and not targeted at another player.</li>
                    <li>Do not share your own or others' personal information.</li>
                    <li>Avoid controversial topics in general chat, including harmful substances, triggering experiences, etc.</li>
                    <li>Any form of staff/player impersonation is strictly prohibited.</li>
                    <li>Keep chat appropriate and respectful at all times.</li>
                    <li>Conversations in global chat should be kept in English.</li>
                    <li>Refrain from engaging in conversation that makes any player uncomfortable.</li>
                    <li><h2>No spamming, including but not limited to:</h2></li>
                    <ul>
                        <li>Character spam.</li>
                        <li>Excessive capitalization or symbols filling chat.</li>
                        <li>Flooding chat.</li>
                        <li>Repeating the same message multiple times.</li>
                    </ul>
                </ul>
                <h2>Advertising Guidelines</h2>
                <ul>
                    <li>
                        All in-game advertising should be conducted in the trade chat. Excessive or overly aggressive
                        advertising may result in action being taken.
                    </li>
                    <li>
                        Advertising using the auction house or community chest is prohibited.
                    </li>
                    <li>
                        Strictly no advertising of other Minecraft servers or Discord servers.
                        This includes mentioning any other server in any chat.
                    </li>
                    <li>
                        While a private Discord channel for your town members is permitted, refrain from sharing it outside your town
                        or utilizing it for advertising purposes.
                    </li>
                </ul>
            </div>
        </>
    );
};

export default ConductRules;