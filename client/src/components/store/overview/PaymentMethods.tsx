import styles from "./PaymentMethods.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {
    faCcAmex,
    faCcApplePay,
    faCcMastercard,
    faCcPaypal,
    faCcVisa,
    faGooglePay
} from "@fortawesome/free-brands-svg-icons";
import {STORE_PAYMENT_METHODS, StorePaymentMethod} from "@/constants.ts";

const ICONS: Record<StorePaymentMethod, { icon: IconDefinition, label: string }> = {
    visa: {icon: faCcVisa, label: "Visa"},
    mastercard: {icon: faCcMastercard, label: "Mastercard"},
    amex: {icon: faCcAmex, label: "American Express"},
    paypal: {icon: faCcPaypal, label: "PayPal"},
    applepay: {icon: faCcApplePay, label: "Apple Pay"},
    googlepay: {icon: faGooglePay, label: "Google Pay"}
};

function PaymentMethods() {
    return (
        <div className={styles.payments}>
            <span className={styles.heading}>Secure payments by Tebex</span>
            <ul className={styles.methods}>
                {STORE_PAYMENT_METHODS.map(method => {
                    const {icon, label} = ICONS[method];
                    return (
                        <li key={method} title={label}>
                            <FontAwesomeIcon icon={icon} aria-hidden="true"/>
                            <span className={styles.visuallyHidden}>{label}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default PaymentMethods;
