import styles from "@/components/rules/RulesContent.module.scss";


const StoreRules = () => {
    return (
        <>
            <div className={styles.rulesTitleText}>
                <h1>Store Guidelines</h1>
            </div>
            <div className={styles.rulesBodyText}>
                <strong>
                    Please be aware, our store is operated by Tebex. Chargebacks will result in a ban from ALL Tebex run
                    stores and Tebex will fight chargebacks.
                </strong>
                <ul>
                    <li>
                        All store purchases are non-refundable. In case of errors, staff will assist in resolving the issue. We
                        reserves the right to accept or deny any refund request for any reason.
                    </li>
                    <li>
                        Initiating a chargeback will result in an immediate permanent ban,
                        and any claim to the money will be forfeited.
                    </li>
                    <li>
                        When purchasing crate keys, be aware that they grant random rewards, and you must accept associated risks.
                        Item previews are available in the store and in-game.
                    </li>
                </ul>
                <h2>Personalized Tags must adhere to the following</h2>
                <ul>
                    <li>Tags must be bold, in lettercase, and may only be one word.</li>
                    <li>No additional effects such as strikethrough, italics, or obfuscated text.</li>
                    <li>A maximum of two RGB colors may be used.</li>
                    <li>Inappropriate or offensive words are forbidden.</li>
                    <li>Event-related terms may be denied.</li>
                    <li>Tags must be unique, anything existing in the server may be denied.</li>
                    <li>Staff retains the right to reject any tag for any reason and can withdraw permission to a previously accepted tag at any time.</li>
                </ul>
            </div>
        </>
    );
};

export default StoreRules;