import styles from "@/components/rules/RulesContent.module.scss";
import {DISCORD_INV, STORE} from "@/constants.ts";
import {quickLink} from "@/components/rules/RulesContent.tsx";

const PoliciesRules = () => {
    return (
        <>
            <h1 className={styles.rulesTitleText}>
                Policies
            </h1>
            <div className={styles.rulesBodyText}>
                <h2>Policy on IRL/Store Trading</h2>
                <strong>To maintain fairness and integrity within LumaMC, please be aware of the following guidelines
                    regarding real-world trading:</strong>
                <ul>
                    <li>IRL Trading (in-game money/items for real money) is strictly prohibited on Luma.</li>
                    <li>Payments conducted outside of our platforms cannot be tracked or confirmed by us.</li>
                    <li>Trading {quickLink('store', STORE)} items for in-game money or items is permissible as it is
                        trackable and kept within Luma.
                    </li>
                </ul>
                <h2>Policy on Scamming</h2>
                <strong>The act of scamming in any form is strictly prohibited. This encompasses, but is not limited
                    to:</strong>
                <ul>
                    <li>Creation of deceptive items meant to imitate valuable items or currency.</li>
                    <li>Taking advantage of new players.</li>
                    <li>Selling goods for an unreasonable amount of money, including listing items at exorbitant prices
                        under the guise of "donation" items.
                    </li>
                    <li>Establishing chest shops that buy items at ridiculously below market value.</li>
                    <li>Exploiting clearly incorrect pricing from a player, such as intentionally leaving a zero off a
                        chest shop price.
                    </li>
                    <li>Failure to fulfill agreements in player-to-player deals, the job must be completed, and the
                        worker must be paid the full agreed-upon amount.
                    </li>
                </ul>
                <h2>Reporting Procedures</h2>
                <ul>
                    <li>Directly report any players breaking rules to staff, providing proof/evidence whenever possible
                        through our discord tickets.
                    </li>
                    <li>If reporting a staff member, please message an admin directly via Discord.</li>
                    <li>Multiple false reports lacking evidence may lead to punitive measures.</li>
                    <li>Avoid creating blank tickets; instead, promptly respond with details regarding your issue.</li>
                </ul>
                <h2>Mute & Ban Policies</h2>
                <ul>
                    <li>It is strictly prohibited to work around a mute. This includes using signs, books, paper, or any
                        other method to communicate with players in-game.
                    </li>
                    <li>If you react negatively while muted, your punishment may be escalated. It is crucial to address
                        the issue directly with staff in private channels.
                    </li>
                    <li>For appeals, please use Discord and submit a ticket. Refrain from reaching out to staff members
                        directly for this purpose.
                    </li>
                </ul>
                <h2>Creativity Policy</h2>
                <ul>
                    <li>Inappropriate usernames or skins may result in a ban until they are changed.</li>
                    <li>The use of inappropriate or disrespectful names, skins, tags, map art, signs, pixel art, books,
                        etc. (anything customizable) is not allowed.
                    </li>
                    <li>Renamed or edited items should not result in chat spam when showcased; hence, names and lores
                        must not be excessively long.
                    </li>
                    <li>When in doubt, it is recommended to seek guidance from any staff member.</li>
                </ul>
                <h2>Policy on Alternative Accounts</h2>
                <strong>Using multiple accounts, also known as alts, is strictly prohibited within our community due to
                    the unfair advantages they provide. Rules against this include:</strong>
                <ul>
                    <li>Account sharing.</li>
                    <li>Utilizing an alternate account to evade a ban.</li>
                    <li>Leveraging an alternative account for unfair advantages, such as claiming referral rewards or
                        acquiring additional event items.
                    </li>
                    <li>If found using another account to gain extra event rewards of advantages, your main account will
                        be banned for a minimum of the duration of the event.
                    </li>
                    <li>If you have multiple friends/family in your household please let a staff member know or open a
                        ticket.
                    </li>
                </ul>
                <strong>TL;DR, one account per person.</strong>
                <h2>Punishment Policy</h2>
                <ul>
                    <li>Punishments are handled on a case-by-case basis, and no two instances of rule-breaking will
                        necessarily receive the same punishment.
                    </li>
                    <li>Previous punishments (including warnings) may be considered when determining consequences,
                        especially if there is a lack of behavioral improvement.
                    </li>
                    <li>Any attempt to evade punishments is strictly against the rules.</li>
                    <li>Staff members reserve the right to administer punishments based on any grounds they deem
                        necessary. If you feel a punishment is made unfairly, make a ticket on
                        our {quickLink('discord', DISCORD_INV)} to appeal or directly message an admin to report a staff
                        member.
                    </li>
                </ul>
                <strong>Conversations with other players, regardless of the setting related to the server, are subject
                    to the same rules. This includes:</strong>
                <ul>
                    <li>Direct messages (DMs) between two LumaMC players.</li>
                    <li>Discord channels created specifically for any Town in-game.</li>
                </ul>
            </div>
        </>
    );
};

export default PoliciesRules;