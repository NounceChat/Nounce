import styles from "./MessageThread.module.scss"
import Grogu from "../../assets/img/Grogu.webp"

const MessageThread = () => {
  return (
    <div id={styles.mssg_thread}>
    
      <div className={styles.avatar}>
        <img src={Grogu} alt="" />
      </div>

      <div className={styles.name_mssg}>
        <p className={styles.name}>
          Grogu Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero reprehenderit, doloribus obcaecati eaque accusamus recusandae reiciendis sint! Exercitationem, sapiente. Alias aspernatur excepturi quod repudiandae dolores nam, sunt nulla tempore quas?
        </p>
        <div className={styles.mssg_preview}>
          I am one with the force Lorem ipsum blah blah
          </div>
      </div>

      <div className={styles.time}>
        <p>00:00 AM</p>
      </div>

    </div>
    
    // <Stack
    // display="flex"
    // direction="row"
    // >
    //   <Stack
    //   alignContent="center"
    //   >
    //     <Avatar variant="rounded" src={Grogu}/>
    //   </Stack>

    //   <Stack>
    //     <Typography fontWeight={700}>Name</Typography>
    //     <Typography>Message...</Typography>
    //   </Stack>

    //   <Typography>Time</Typography>
    // </Stack>
  )
}

export default MessageThread