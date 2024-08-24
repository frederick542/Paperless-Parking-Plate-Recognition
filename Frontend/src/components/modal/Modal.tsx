import { useState } from "react";
import styles from "./Modal.module.css";
import { useModal } from "../../hooks/modalHooks";
import { formatDate, formatTime } from "../../services/timeService";
import { callApi } from "../../utils/apiUtils";

export const Modal = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { modalItem, showModal, closeModal } = useModal();

  const handleSave = () => {
    if (inputValue.trim() === "") {
      setError("Cannot be empty!");
    } else {
      setError(null);
      callApi("changePlate", "post", {
        plateBefore: modalItem?.plateNumber,
        plateAfter: inputValue,
      });
      closeModal();
    }
  };

  if (!showModal || !modalItem) return null;

  return (
    <div className={styles.container}>
      <div className={styles.itemContainer}>
        <div className={styles.top}>
          <h1 className={styles.plate}>{modalItem.plateNumber}</h1>
          <button className={styles.close} onClick={closeModal}>
            X
          </button>
        </div>
        <div className={styles.formContainer}>
          <div className={styles.formObjectContainer}>
            <img className={styles.image} src={modalItem.image} alt="Item" />
          </div>
          <div className={styles.formObjectContainer}>
            <p className={styles.text}>Date: {formatDate(modalItem.time_in)}</p>
            <p className={styles.text}>Time: {formatTime(modalItem.time_in)}</p>
            <div className={styles.plateRename}>
              <p className={styles.text}>Change to: </p>
              <input
                className={styles.input}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </div>
        <p className={`${styles.error} ${error ? styles.visible : ""}`}>
          {error}
        </p>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};
