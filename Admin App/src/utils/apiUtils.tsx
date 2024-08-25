import axios from "axios";

const apiAddress = import.meta.env.VITE_API_ADDRESS;

const callApi = async (dest: string, method: string, data: object) => {
  try {
    const address = `${apiAddress}${dest}`;
    const response = await axios({
      method: method,
      url: address,
      data: data,
      withCredentials: true,
    });
    return {
      data: response.data,
      status: 200,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          status: error.response.status,
        };
      }
    } else {
    }
    return {
      status: 520,
      error: error,
    };
  }
};

const verifyCookie = async () => {
  try {
    const address = `${apiAddress}/verifyCookie`;
    await axios({
      method: "post",
      url: address,
      withCredentials: true,
    });
    return true;
  } catch (error: unknown) {
    return false;
  }
};

export { callApi, verifyCookie };
