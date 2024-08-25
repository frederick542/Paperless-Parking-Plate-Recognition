import React from "react";
import { ClipLoader } from "react-spinners";
import styles from "./Loading.module.css";
export const LoadingPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <ClipLoader color="#3498db" size={50} />
      <p className={styles.text}>Loading...</p>
    </div>
  );
};
