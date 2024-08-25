import { useEffect, useState } from "react";
import { SearchVariable } from "../../components/searchAttribute/SearchVariable";
import styles from "./Home.module.css";
import stylesItem from "../../components/itemComponents/itemBlock/itemBlock.module.css";
import { SearchButton } from "../../components/searchButton/SearchButton";
import { SearchButtonProps } from "../../model/queryInterface";
import { createConnection } from "../../services/websocketService";
import { ItemContainer } from "../../components/itemComponents/itemContainer/ItemContainer";
import { Item } from "../../model/item";
import { formatDate, formatTime } from "../../services/timeService";
import { Modal } from "../../components/modal/Modal";
import { useModal } from "../../hooks/modalHooks";

export const Home = () => {
  const [previousLength, setPreviousLength] = useState<number>(-1);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [extendStatus, setExtendStatus] = useState(true);
  const [sendItem, setSendItem] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [socket, setSocket] = useState<WebSocket>();
  const [onQuery, setOnQuery] = useState<boolean>(false);
  const [payload, setPayload] = useState<SearchButtonProps>({
    date: "",
    timeInLowerLimit: "",
    timeInUpperLimit: "",
    plateNumber: "",
    operation: "",
  });
  useModal();
  useEffect(() => {
    setSocket(createConnection(setItems, setSendItem));
  }, []);

  useEffect(() => {
    if (items.length == previousLength) {
      setExtendStatus(false);
    } else {
      setExtendStatus(true);
    }
  }, [items]);

  useEffect(() => {
    if (onQuery && !date && !startTime && !endTime && !plateNumber) {
      console.log("HIIBABYYY");
      setPreviousLength(-1);

      const newPayload: SearchButtonProps = {
        date: "",
        timeInLowerLimit: "",
        timeInUpperLimit: "",
        plateNumber: "",
        operation: "",
      };

      setPayload(newPayload);

      const payloadString = JSON.stringify({
        payload: newPayload,
        type: "default",
      });
      setOnQuery(false);
      socket?.send(payloadString);
    }
  }, [date, startTime, endTime, plateNumber, onQuery]);

  useEffect(() => {
    if (sendItem && payload.operation === "foward") {
      const payloadString = JSON.stringify({
        payload: payload,
        type: onQuery ? "default" : "query",
      });

      socket?.send(payloadString);
      setSendItem(false);
    }
  }, [payload, sendItem]);

  const extend = () => {
    if (extendStatus === false) {
      return;
    }

    setPayload((prevPayload) => ({
      date: prevPayload?.date || "",
      timeInLowerLimit: prevPayload?.timeInLowerLimit || "",
      timeInUpperLimit: prevPayload?.timeInUpperLimit || "",
      plateNumber: prevPayload?.plateNumber || "",
      operation: "foward",
    }));

    setSendItem(true);
    setPreviousLength(items.length);
  };

  return (
    <div className={styles.page}>
      <Modal />
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <p className={styles.title}>Parking List</p>
        </div>
        <div className={styles.contentcCotainer}>
          <div className={styles.searchCotainer}>
            <SearchVariable
              onVariableChange={setDate}
              Title="Date (default today)"
              InputType="date"
            />
            <SearchVariable
              onVariableChange={setStartTime}
              Title="Time Start"
              InputType="time"
            />
            <SearchVariable
              onVariableChange={setEndTime}
              Title="Time End"
              InputType="time"
            />
            <SearchVariable
              onVariableChange={setPlateNumber}
              Title="Plate"
              InputType="text"
            />
            <SearchButton
              payload={
                {
                  date,
                  timeInLowerLimit: startTime,
                  timeInUpperLimit: endTime,
                  plateNumber,
                } as SearchButtonProps
              }
              socket={socket}
              setOnQuery={setOnQuery}
              setPayload={setPayload}
            />
          </div>
          <div className={styles.contentTitleContainer}>
            <div className={stylesItem.block}>
              <p className={styles.contentTitle}>Vehicle Image</p>
            </div>
            <div className={stylesItem.block}>
              <p className={styles.contentTitle}>Plate</p>
            </div>
            <div className={stylesItem.block}>
              <p className={styles.contentTitle}>Date</p>
            </div>
            <div className={stylesItem.block}>
              <p className={styles.contentTitle}>Time In</p>
            </div>
          </div>
          {items.length > 0 &&
            items
              .filter((item) => item !== null)
              .map((item, index) => (
                <ItemContainer
                  item={item}
                  key={index}
                  link={item.image}
                  plate={item.plateNumber}
                  date={formatDate(item.time_in)}
                  timeIn={formatTime(item.time_in)}
                />
              ))}
        </div>
        <button
          className={styles.extendButton}
          onClick={() => {
            extend();
          }}
        >
          {extendStatus ? "tap here to extend" : "no more items"}
        </button>
      </div>
    </div>
  );
};
