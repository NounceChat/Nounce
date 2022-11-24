import styles from "./ChatDate.module.scss";

const ChatDate = ({ chatDate }: any) => {
  const dateFormat = () => {
    const d = new Date(chatDate);
    const now = new Date();

    const dTime = d.getTime();
    const nowTime = now.getTime();
    const timeDiff = nowTime - dTime;

    const timeD = d.toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
    });

    const dMonth =
      d.getMonth() == 0
        ? "Jan"
        : d.getMonth() == 1
        ? "Feb"
        : d.getMonth() == 2
        ? "Mar"
        : d.getMonth() == 3
        ? "Apr"
        : d.getMonth() == 4
        ? "May"
        : d.getMonth() == 5
        ? "Jun"
        : d.getMonth() == 6
        ? "Jul"
        : d.getMonth() == 7
        ? "Aug"
        : d.getMonth() == 8
        ? "Sep"
        : d.getMonth() == 9
        ? "Oct"
        : d.getMonth() == 10
        ? "Nov"
        : "Dec";

    const dDay = d.getDate() + 1;
    const dYear = d.getFullYear();

    const dayWeek =
      d.getDay() == 0
        ? "Sun"
        : d.getDay() == 1
        ? "Mon"
        : d.getDay() == 2
        ? "Tue"
        : d.getDay() == 3
        ? "Wed"
        : d.getDay() == 4
        ? "Thu"
        : d.getDay() == 5
        ? "Fri"
        : "Sat";

    if (timeDiff < 86400 * 1000) {
      return timeD;
    } else if (timeDiff > 86400 * 1000 && timeDiff < 604800 * 1000) {
      return `${dayWeek} ${timeD}`;
    } else if (timeDiff > 604800 * 1000) {
      return `${dMonth} ${dDay}, ${dYear}`;
    }
  };
  return (
    <div id={styles.timeContainer}>
      <p>{dateFormat()}</p>
    </div>
  );
};

export default ChatDate;
