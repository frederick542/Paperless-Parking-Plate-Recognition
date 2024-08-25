import styles from "./Login.module.css";
import { LoginForm } from "../../components/loginForm/LoginForm";
export const Login = () => {
  return (
    <div className={styles.page}>
      <LoginForm />
    </div>
  );
};
