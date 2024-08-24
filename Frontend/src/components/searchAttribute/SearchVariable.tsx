import styles from "./SearchVariable.module.css";
interface SearchVariableProps {
  onVariableChange: (value: string) => void;
  Title: string;
  InputType: string;
}

export const SearchVariable = ({
  onVariableChange,
  Title,
  InputType,
}: SearchVariableProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onVariableChange(event.target.value);
  };

  return (
    <div className={styles.container}>
      <label className={styles.title}>{Title}</label>
      <input
        className={styles.input}
        type={InputType}
        onChange={handleChange}
      />
    </div>
  );
};
