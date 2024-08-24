import React from "react";
import { gueryVehicle } from "../../services/queryService";
import styles from "./SearchButton.module.css";
import { SearchButtonProps } from "../../model/queryInterface";

interface SearchButtonPropsWithSetter {
  payload: SearchButtonProps;
  setOnQuery: React.Dispatch<React.SetStateAction<boolean>>;
  socket: WebSocket | undefined;
}

export const SearchButton: React.FC<SearchButtonPropsWithSetter> = ({
  payload,
  setOnQuery,
  socket,
}) => {
  const queryFilter = () => {
    gueryVehicle(payload, socket);
    setOnQuery(true);
  };

  return (
    <div className={styles.container}>
      <p className={styles.filler}>filler</p>
      <button className={styles.button} onClick={queryFilter}>
        Search
      </button>
    </div>
  );
};
