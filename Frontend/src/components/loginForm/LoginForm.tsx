import { useState } from "react";
import styles from "./LoginForm.module.css";
import { handleLogin } from "../../services/authService";
import { useAuth } from "../../utils/context/authContext";

export const LoginForm = () => {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const login = async () => {
    const result = await handleLogin(username, password);
    if (result.status == 401) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } else if (result.status == 200) {
      loginUser();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBackground}>
        <p className={styles.title}>Sign In</p>
        <p
          className={`${styles.errorMessage} ${
            showError ? styles.active : styles.inactive
          }`}
        >
          Check your username or password again!
        </p>
      </div>
      <div className={styles.background}></div>
      <input
        placeholder="username"
        className={styles.form}
        type="text"
        onChange={(e) => setUsername(e.target.value)}
      ></input>
      <input
        placeholder="password"
        className={styles.form}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className={styles.button} onClick={login}>
        Sign in
      </button>
    </div>
  );
};
