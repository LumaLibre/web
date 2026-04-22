import styles from "@/components/rules/RulesContent.module.scss";
import {WIKI_LINK} from "@/constants.ts";
import {quickLink, AnchorHeading} from "@/components/rules/RulesContent.tsx";


const GameplayRules = () => {
    return (
        <>
            <h1 id="gameplay" className={styles.rulesTitleText}>
                Gameplay Rules
            </h1>
            <div className={styles.rulesBodyText}>
                <AnchorHeading id="gameplay-construction">Construction Guidelines</AnchorHeading>
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
                <AnchorHeading id="gameplay-griefing-stealing">Griefing & Stealing</AnchorHeading>
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
                    <li>Resource gathering must be done in the designated resource worlds. Defacing or excessively
                        altering the main worlds in unclaimed areas is not allowed.
                    </li>
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
                <AnchorHeading id="gameplay-bugs-glitches">Bugs & Glitches</AnchorHeading>
                <strong>Exploiting bugs is deemed an unfair advantage and will result in appropriate penalties. Such
                    exploits include:</strong>
                <ul>
                    <li>Duplicating items in any way.</li>
                    <li>Breaking blocks not meant to be broken.</li>
                    <li>Obtaining unobtainable blocks.</li>
                    <li>Gaining access to restricted areas.</li>
                    <li>Any action providing you or your town an advantage through a bug or glitch.</li>
                    <li>Attempting to bypass the anti-AFK system or using in-game mechanics/third-party software to
                        avoid being marked as AFK is prohibited.
                    </li>
                </ul>
                <strong>Please report any found bugs to a staff member or in a ticket as quickly as possible. If found
                    exploiting, sharing, or abusing bugs, staff will take action as seen fit.</strong>
                <AnchorHeading id="gameplay-pvp">PvP Guidelines</AnchorHeading>
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
                <AnchorHeading id="gameplay-redstone-farms">Redstone & Farm Regulations</AnchorHeading>
                <strong>Our up to date redstone and farm limits can be found on
                    our {quickLink('wiki', WIKI_LINK('basics/farms-and-limits'))}. Strictly
                    prohibited redstone devices or machines are:</strong>
                <ul>
                    <li>Lag machines.</li>
                    <li>Flying machines.</li>
                    <li>Mob farms that spawn an unreasonable number of mobs.</li>
                    <li>Zero tick farms.</li>
                    <li>Auto-brewers and cookers are permitted within redstone limits, as long as they do not cause
                        immense
                        lag.
                    </li>
                    <li>Avoid spawning a high number of bosses or mobs, such as Withers, Snow Golems, etc.</li>
                </ul>
                <strong>Any redstone machine or farm that causes significant lag to the server will be removed without
                    warning.</strong>
                <AnchorHeading id="gameplay-unfair-advantages">Unfair Advantages</AnchorHeading>
                <strong>Within our community, maintaining a fair and level playing field is important. If found to be
                    cheating, staff will take action.</strong>
                <ul>
                    <li>Mods that grant players an unfair advantage. If uncertain about a mod's permissibility, please
                        seek clarification from staff first.
                    </li>
                    <li>Usage of cheat clients (Wurst, Impact, Future).</li>
                    <li>X-ray of any kind via texture packs, etc.</li>
                    <li>Automatic functions such as auto mining or clicking.</li>
                    <li>The use of multiple accounts (pertains to our Alternative Accounts policy).</li>
                    <li>Any form of macros or programs designed to provide an advantage.</li>
                    <li>Exploiting bugs or accidental in-game features for personal gain (pertains to our Bugs &
                        Glitches section).
                    </li>
                </ul>
                <strong>Before using any mods, especially if uncertain about their permissibility, please consult with
                    staff for approval.</strong>
                <AnchorHeading id="gameplay-folia">Folia Region Guidelines</AnchorHeading>
                <strong>We have specific guidelines for specific Folia regions, please read through these carefully if
                    you intend to build farms or grinders.</strong>
                <ul>
                    <li>Saturating a region with farms is not allowed (high thread utilization or MSPT). Any violating
                        farm or grinder will be removed without warning.
                    </li>
                    <li>Excessive use of tile entities or other mechanisms that cause lag to Minecraft clients is not
                        allowed.
                    </li>
                    <li>Farms or areas that cause a concerning amount of lag to a region, regardless of their location
                        may be asked to have certain portions removed or changed.
                    </li>
                    <li>We reserve the right to ask players to change their farms for any given reason or remove
                        portions of farms we feel are unfit for gameplay on Luma.
                    </li>
                </ul>
                <strong>All players ranked Serene/Arcane or higher have access to <code>/tps</code>. You may view the
                    performance of a region at any time.</strong>
                <AnchorHeading id="gameplay-automation">Automation</AnchorHeading>
                <ul>
                    <li>Automation of any job action that does not pay out using a job block (e.g. furnace, brewing
                        stand, etc.) is not allowed.
                    </li>
                    <li>Chunk loaders of any kind are not allowed. Only players are permitted to keep chunks
                        persistently loaded on Luma.
                    </li>
                    <li>While AFK farms are allowed, mobs will only drop 10% of their normal loot table if not killed by
                        another entity.
                    </li>
                    <li>Using client mods to automate any action with <strong>Jobs</strong> is not allowed. This
                        explictly includes Litematica.
                    </li>
                    <li>Bypassing our AFK timer in any form is not allowed (as pertains to our Bugs & Glitches section).
                    </li>
                </ul>
            </div>
        </>
    );
};

export default GameplayRules;