import styles from "./itemBlock.module.css";

interface ItemBlockProps {
  link?: string;
  title?: string;
}

export const ItemBlock: React.FC<ItemBlockProps> = ({
  link = null,
  title = null,
}) => {
  return (
    <div className={styles.block}>
      {link ? (
        <img className={styles.carImage} src={link} alt="" />
      ) : (
        <div className={styles.title}>{title}</div>
      )}
    </div>
  );
};
