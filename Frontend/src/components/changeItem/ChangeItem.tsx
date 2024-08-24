import { useModal } from "../../hooks/modalHooks";
import { Item } from "../../model/item";
import styles from "./ChangeItem.module.css";

interface ChangeItemProps {
  item: Item;
}

export const ChangeItem: React.FC<ChangeItemProps> = ({ item }) => {
  const { openModal} = useModal();
  return (
    <div className={styles.block}>
      <button
        onClick={() => {
          openModal(item);
        }}
        className={styles.title}
      >
        Change Plate
      </button>
    </div>
  );
};
