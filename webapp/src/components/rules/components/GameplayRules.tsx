import styles from "@/components/rules/RulesContent.module.scss";
import {WIKI_LINK} from "@/constants.ts";
import {quickLink} from "@/components/rules/RulesContent.tsx";


const GameplayRules = () => {
    return (
        <>
            <h1 className={styles.rulesTitleText}>
                Gameplay Rules
            </h1>
            <div className={styles.rulesBodyText}>
                <h2>Construction Guidelines</h2>
                <ul>
                    <li>No offensive or inappropriate builds.</li>
                    <li>Respect the boundaries of other towns.</li>
                    <li>Avoid constructing within 10 chunks of someone else's build, unless explicit permission has been
                        granted.
                    </li>
                    <li>Prohibition of spider claiming (claiming chunks in an unusual way to cover the most land and
                        prevent others from claiming).
                    </li>
                    <li>Every chunk used for building must be properly claimed.</li>
                    <li>Avoid claiming public, server, or resource spots.</li>
                    <li>Do not take credit for someone else's work.</li>
                    <li>For permanent builds, it is advised to create them in Main Worlds to prevent deletion during
                        Resource World resets.
                    </li>
                    <li>Litematica is allowed for tracing schematics.</li>
                    <li>Easy Place is permissible but only for the purpose of building permanent structures or Mapart.
                        (Printer is <strong>not</strong> allowed!)
                    </li>
                    <li>Any method utilizing building aids or mods in a way deemed as "exploiting" by staff is strictly
                        prohibited.
                    </li>
                </ul>
                <h2>Griefing & Stealing</h2>
                <strong>
                    Griefing or defacing any player's builds without permission is strictly prohibited.
                    This includes, but is not limited to:
                </strong>
                <ul>
                    <li>Building permanent structures within 10 chunks of another town/claim.</li>
                    <li>Destroying builds within 10 chunks of another town/claim.</li>
                    <li>Defacing unclaimed areas.</li>
                    <li>Not replanting crops of farms not owned by you.</li>
                    <li>Any form of damage to another player's builds without permission.</li>
                    <li>Towns in ruin may not be claimed over unless permission is granted by staff.</li>
                </ul>
                <strong>
                    Stealing items, loot, mob drops, etc., from other players is strictly prohibited. Among these are:
                </strong>
                <ul>
                    <li>Using a map to steal map art.</li>
                    <li>Following players during an event or minigame to steal items/loot.</li>
                    <li>Copying designs/builds from another player without permission.</li>
                    <li>Claiming towns/chunks within 10 chunks of another town without permission may result in the
                        town/claim being removed. In the case of an accident, the town may be moved.
                    </li>
                    <li>Stealing from unprotected chests, unless they are specifically tagged as a sort of community or
                        shared chest, is not allowed.
                    </li>
                </ul>
                <h2>Bugs & Glitches</h2>
                <strong>Exploiting bugs is deemed an unfair advantage and will result in appropriate penalties. Such
                    exploits include:</strong>
                <ul>
                    <li>Duplicating items in any way.</li>
                    <li>Breaking blocks not meant to be broken.</li>
                    <li>Obtaining unobtainable blocks.</li>
                    <li>Gaining access to restricted areas.</li>
                    <li>Any action providing you or your town an advantage through a bug or glitch.</li>
                    <li>Attempting to bypass the anti-AFK system.</li>
                </ul>
                <strong>Please report any found bugs to a staff member or in a ticket as quickly as possible. If found
                    exploiting, sharing, or abusing bugs, staff will take action as seen fit.</strong>
                <h2>PvP Guidelines</h2>
                <ul>
                    <li>PvP is only allowed outside of <code>/pvp</code> when both players consent. Attacking another
                        player without permission will result in punishment when reported.
                    </li>
                    <li>Utilize <code>/pvp</code> to ensure you don't lose items or experience points while engaging in
                        friendly battles.
                    </li>
                    <li>Staff may ask players to move to <code>/pvp</code> to prevent flooding chat with death messages.
                        Staff reserve the authority to punish players who do not follow instructions.
                    </li>
                </ul>
                <h2>Redstone & Farm Regulations</h2>
                <strong>Our up to date redstone and farm limits can be found on our {quickLink('wiki', WIKI_LINK('basics/farms-and-limits'))}. Strictly
                    prohibited redstone devices or machines are:</strong>
                <ul>
                    <li>Lag machines.</li>
                    <li>Flying machines.</li>
                    <li>Mob farms that spawn an unreasonable number of mobs.</li>
                    <li>Zero tick farms.</li>
                    <li>Auto-brewers and cookers are permitted within redstone limits, as long as they do not cause immense
                        lag.</li>
                    <li>Avoid spawning a high number of bosses or mobs, such as Withers, Snow Golems, etc.</li>
                </ul>
                <strong>Any redstone machine or farm that causes significant lag to the server will be removed without warning.</strong>
                <h2>Unfair Advantages</h2>
                <strong>Within our community, maintaining a fair and level playing field is important. If found to be cheating, staff will take action.</strong>
                <ul>
                    <li>Mods that grant players an unfair advantage. If uncertain about a mod's permissibility, please seek clarification from staff first.</li>
                    <li>Usage of cheat clients (Wurst, Impact, Future).</li>
                    <li>X-ray of any kind via texture packs, etc.</li>
                    <li>Automatic functions such as auto mining or clicking.</li>
                    <li>The use of multiple accounts (pertains to our Alternative Accounts policy).</li>
                    <li>Any form of macros or programs designed to provide an advantage.</li>
                    <li>Exploiting bugs or accidental in-game features for personal gain (pertains to our Bugs & Glitches section).</li>
                </ul>
                <strong>Before using any mods, especially if uncertain about their permissibility, please consult with staff for approval.</strong>
            </div>
        </>
    );
};

export default GameplayRules;