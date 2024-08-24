import { Item } from "../model/item";

const WS_URL = import.meta.env.VITE_WS_URL;

const createConnection = (
  setItems: React.Dispatch<React.SetStateAction<Item[]>>,
) => {
  console.log("Creating WebSocket connection...");
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(data)
      if (data.type == "update") {
        setItems((prevItems) => {
          const updatedItems = [...prevItems];
          return updatedItems.map((item) => {
            if (item.plateNumber == data.data.plateNumber) {
              return data.data;
            }
            return item;
          });
        });
      } else {
        sessionStorage.setItem(
          "history",
          JSON.stringify({
            firstDocId: data.firstDocId,
            lastDocId: data.lastDocId,
          })
        );
        setItems(data.data);
      }
    } catch (error) {
      setItems([]);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed", event);
  };

  return socket;
};

export { createConnection };
