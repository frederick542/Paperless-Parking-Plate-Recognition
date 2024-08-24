import { SearchButtonProps } from "../model/queryInterface";

const gueryVehicle = async (
  data: SearchButtonProps,
  socket: WebSocket | undefined,
) => {
  try {
    if (!data.timeInLowerLimit && !data.timeInUpperLimit && !data.date) {
      throw new Error(
        "Both timeInLowerLimit and timeInUpperLimit are missing.",
      );
    }
    let lowerTimeBound = "";
    let upperTimeBound = "";

    if (!data.timeInLowerLimit && !data.timeInUpperLimit && data.date) {
      lowerTimeBound = `${data.date}T00:00:00.000Z`;

      upperTimeBound = `${data.date}T23:59:59.999Z`;
    } else {
      lowerTimeBound = data.timeInLowerLimit
        ? `${data.date}T${data.timeInLowerLimit}:00.000`
        : new Date().toISOString();

      upperTimeBound = data.timeInUpperLimit
        ? `${data.date}T${data.timeInUpperLimit}:00.000`
        : new Date().toISOString();
    }
    const newDate = [
      new Date(lowerTimeBound).toISOString(),
      new Date(upperTimeBound).toISOString(),
    ];
    let payload;
    if (data.operation) {
      const history = JSON.parse(sessionStorage.getItem("history") || "null");
      let historyData;
      if (data.operation == "foward") {
        historyData = history["lastDocId"];
      } else if (data.operation == "backward") {
        historyData = history["firstDocId"];
      }
      payload = {
        plateNumber: data.plateNumber,
        timeInLowerLimit: newDate[0],
        timeInUpperLimit: newDate[1],
        operation: data.operation,
        lastVisibleId: historyData,
      };
    } else {
      payload = {
        plateNumber: data.plateNumber,
        timeInLowerLimit: newDate[0],
        timeInUpperLimit: newDate[1],
        operation: data.operation,
      };
    }
    const payloadString = JSON.stringify({
      payload: payload,
      type: "query",
    });
    socket?.send(payloadString);
  } catch (error) {
    const payloadString = JSON.stringify({
      payload: data,
      type: "query",
    });
    socket?.send(payloadString);
  }
};

export { gueryVehicle };
