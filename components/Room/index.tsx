import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'
import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { Speaker } from '../Speaker'
import styles from './Room.module.scss'
import io, { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Axios } from '../../core/axios'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectUserData } from '../../redux/selectors'
import Peer from 'simple-peer'
import { UserData } from '../../pages'
import { useSocket } from '../../hooks/useSocket'

interface RoomProps {
  title: string
}

type User = {
  fullName: string
  avatarUrl: string
}

export const Room: React.FC<RoomProps> = ({ title }) => {
  const user = useSelector(selectUserData)
  const [users, setUsers] = React.useState<UserData[]>([])
  const router = useRouter()
  const roomId = router.query.id
  const socket = useSocket()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      socket = io('http://localhost:3001') // определили куда отправляем сокет-запросы

      window.socket = socket

      socket.emit('CLIENT@ROOMS:JOIN', {
        user,
        roomId,
      }) // присоединяем текущего юзверя к комнате, в которую он вошёл(на которую кликнул)

      socket.on('SERVER@ROOMS:LEAVE', (user: UserData) => {
        setUsers(prev => prev.filter(obj => obj.id !== user.id))
      })

      socket.on('SERVER@ROOMS:JOIN', allUsers => {
        setUsers(allUsers)
      }) // получаем ответ от сервера, когда другой юзверь законнектился к комнате

      // setUsers(prev => [...prev, user])
    }

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      {/* <audio controls /> */}
      <div className="d-flex align-items-center justify-content-between">
        <h2>{title}</h2>
        <div
          className={clsx('d-flex align-items-center', styles.actionButtons)}>
          <Link href="/rooms">
            <a>
              <Button color="gray" className={styles.leaveButton}>
                <img
                  width={18}
                  height={18}
                  src="/static/peace.png"
                  alt="Hand black"
                />
                Leave quietly
              </Button>
            </a>
          </Link>
        </div>
      </div>

      <div className="users">
        {users.map(obj => (
          <Speaker id={obj.fullName} key={obj.fullName} {...obj} />
        ))}
      </div>
    </div>
  )
}
