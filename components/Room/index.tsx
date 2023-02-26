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

// TODO: реализовать destroy webRtc соединения

export const Room: React.FC<RoomProps> = ({ title }) => {
  const user = useSelector(selectUserData)
  const [users, setUsers] = React.useState<UserData[]>([])
  const router = useRouter()
  const roomId = router.query.id
  const socket = useSocket()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // ниже вся логика webRtc соединения
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(stream => {
          // 1. Оповещаем всех юзверей в комнате, что вошёл новый юзер и отправляем им свои данные(id, ФИО и прочее)
          socket.emit('CLIENT@ROOMS:JOIN', {
            user,
            roomId,
          })

          // 2. на наше первое действие получаем ответ в виде массива всех юзверей, которые теперь есть в комнате(там теперь все кто был + мы)
          socket.on('SERVER@ROOMS:JOIN', allUsers => {
            console.log('Список пользователей -> ', allUsers)
            // в текущей реализации 2 юзера имеют возможность созваниваться друг с другом.
            setUsers(allUsers) // сейвим в стейт для отображения юзера в интерфейсе приложения
            const targetUser = allUsers.find(man => man.id !== user.id) // targetUser - это другой юзер(ну то есть НЕ ты) и ему нужно позвонить

            // проверка ниже нужна для ситуации, в которой в пустую комнату заходит юзер и
            // если отправлять свой signal некому, то и обработчики событий создавать незачем, кроме того мы ещё и потеряем signal пользователя и
            // не сможем создать соединение в обратную сторону с новым юзером, поэтому мы проверяем:
            // "есть ли в массиве allUsers другой юзер?" и если есть, то устанавливаем с ним связь.
            if (targetUser) {
              const peerIncome = new Peer({
                // peerIncome - это объект, который у каждого юзверя отвечает за передачу голоса (рот)
                initiator: true,
                trickle: false,
                stream,
              })

              peerIncome.on('signal', inComeSignal => {
                // 3. здесь мы отправляем свой inComeSignal другому челу в комнате(передаём сигнал именно ротовой полости)
                // суть webRTC в данном коде передать рот в уши, а уши обратно в рот и сделать это дважды(для каждого юзера)

                socket.emit('CLIENT@ROOMS:CALL', {
                  roomId,
                  inComeSignal,
                })
              })

              socket.on('SERVER@ROOMS:CALL', ({ inComeSignal }) => {
                const peerOutcome = new Peer({
                  // peerIncome - это объект, который у каждого юзера отвечает за принятие чужого голоса (уши)
                  initiator: false,
                  trickle: false,
                  stream,
                })

                peerOutcome.signal(inComeSignal) // 4. помещаем в НАШИ уши сигнал другого чела, который ток что вошёл в комнату

                peerOutcome
                  .on('signal', outComeSignal => {
                    // 5. передаём обратно в рот первого юзера сигнал от ушей второго
                    // то есть сначала юзер-1 передал свой рот в уши юзера-2, а теперь юзер-2 с ушей должен обратно в рот юзеру-1 передать сигнал
                    socket.emit('CLIENT@ROOMS:ANSWER', {
                      roomId,
                      outComeSignal,
                    })
                  })
                  .on('stream', stream2 => {
                    // обработчик, который ловит stream - грубо говоря то, что другой юзер говорит и мы воспроизводим это
                    document.querySelector('audio').srcObject = stream2
                    document.querySelector('audio').play()
                    console.log('STREAM пошёл')
                  })
              })

              socket.on('SERVER@ROOMS:ANSWER', ({ outComeSignal }) => {
                // 6. получаем сигнал с ушей юзера и ниже наконец-то устанавливаем соединение
                peerIncome.signal(outComeSignal)
                console.log('Мы ответили юзеру и установили связь!')
              })
            }
          })
        })
        .catch(() => {
          console.error('Нет доступа к микрофону')
        })

      socket.on('SERVER@ROOMS:LEAVE', (user: UserData) => {
        setUsers(prev => prev.filter(obj => obj.id !== user.id))
      })
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <audio controls />
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
