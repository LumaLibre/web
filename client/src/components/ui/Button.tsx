import styles from "./Button.module.scss";

const Button = ({ text }: { text: string }) => {
  return (
    <button className={styles.customButton}>
      <div className={styles.gradientBorder}></div>
      <div className={styles.buttonContent}>{text}</div>
    </button>
  );
};

export default Button;
