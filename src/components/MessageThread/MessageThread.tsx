// import "./MessageThread.module.scss"
import "./MessageThread.css"

// import { Avatar, Stack, Typography } from "@mui/material"
import Grogu from "../../assets/img/Grogu.webp"

const MessageThread = () => {
  return (
    <div className="mssg-thread">
    
      <div className="avatar">
        <img src={Grogu} alt="" />
      </div>

      <div className="name-mssg">
        <p className="name">Grogu</p>
        <p>I am one with the force</p>
      </div>

      <div className="time">
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