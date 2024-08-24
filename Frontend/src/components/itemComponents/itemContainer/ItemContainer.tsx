import React from "react";
import { ItemBlock } from "../itemBlock/ItemBlock";
import styles from "./ItemContainer.module.css";
import { Item } from "../../../model/item";
import { ChangeItem } from "../../changeItem/ChangeItem";

interface ItemContainerProps {
  link?: string;
  plate?: string;
  date?: string;
  timeIn?: string;
  item : Item
}

export const ItemContainer: React.FC<ItemContainerProps> = ({
  link,
  plate,
  date,
  timeIn,
  item 
}) => {
  return (
    <div className={styles.container}>
      <ItemBlock link={link} />
      <ItemBlock title={plate} />
      <ItemBlock title={date} />
      <ItemBlock title={timeIn} />
      <ChangeItem item={item} />
    </div>
  );
};
