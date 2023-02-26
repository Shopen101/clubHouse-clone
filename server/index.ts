import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import sharp from 'sharp'
import fs from 'fs'
import appRoot from 'app-root-path'
import { nanoid } from 'nanoid'
import socket from 'socket.io'
import { createServer } from 'http'
import { Room } from '../models'

dotenv.config({
  path: 'server/.env',
})

import './core/db'

import { passport } from './core/passport'
import AuthController from './controllers/AuthController'
import RoomController from './controllers/RoomController'
import { uploader } from './core/uploader'
import { UserData } from '../pages'
import { getUsersFromRoom, SocketRoom } from '../utils/getUsersFromRoom'
sharp.cache({ files: 0 })

const app = express()
const server = createServer(app)
const io = socket(server, {
  cors: {
    origin: '*',
  },
})

const rooms: SocketRoom = {}

io.on('connection', socket => {
  // просто оповвещаем, что к сокетам подключились
  console.log('Connected to socket!', socket.id)

  socket.on('CLIENT@ROOMS:JOIN', ({ user, roomId }) => {
    // по команде, которая начинается с CLIENT будет понятно, что запрос прислал клиент
    // оповещаем тут остальных людей в комнате, что новый чел зашёл

    socket.join(`room/${roomId}`) // подключаемся в конкретную комнату
    // тут имя начинается с SERVER - чтобы было понятно, что ответ прислал сервер
    // broadcast значит ответ отправь всем, кроме меня в комнате
    rooms[socket.id] = { roomId, user }
    const speakers = getUsersFromRoom(rooms, roomId)
    io.emit('SERVER@ROOMS:HOME', { roomId: Number(roomId), speakers }) // на главную страницу отправить ответ кто в какую комнату подключился
    io.in(`room/${roomId}`).emit('SERVER@ROOMS:JOIN', speakers) // всем(включая меня) в комнате отправить ответ со списком юзеров в комнате
    Room.update({ speakers }, { where: { id: roomId } })
  })

  // targetUserId - кому звоним(чел, который уже сидел в комнате на момент вхождения нового юзверя)
  // callerUserId - тот чел, который ток что залетел в хату и хочет коннекта с первым челом
  socket.on('CLIENT@ROOMS:CALL', ({ roomId, inComeSignal }) => {
    socket.broadcast // отправляем свой сигнал(номер телефона) всем ребятам в комнате(кроме отправителя), что к вам хочет подключиться кто-то(тот самый отправитель)
      .to(`room/${roomId}`)
      .emit('SERVER@ROOMS:CALL', { inComeSignal })
  })

  socket.on('CLIENT@ROOMS:ANSWER', ({ roomId, outComeSignal }) => {
    socket.broadcast
      .to(`room/${roomId}`)
      .emit('SERVER@ROOMS:ANSWER', { outComeSignal })
  })

  socket.on('disconnect', () => {
    // юзверь отключился от сокетов, типо вышел с комнаты
    if (rooms[socket.id]) {
      const { roomId, user } = rooms[socket.id]
      socket.broadcast.to(`room/${roomId}`).emit('SERVER@ROOMS:LEAVE', user)
      console.log('user disconnected')
      delete rooms[socket.id]
      // ниже отправляем инфу на фронт о том, что какой-то юзер отключился(отображаем это на главной странице со списком всех комнат)
      const speakers = getUsersFromRoom(rooms, roomId)
      io.emit('SERVER@ROOMS:HOME', { roomId: Number(roomId), speakers })
      Room.update({ speakers }, { where: { id: roomId } })
    }
  })
})

app.use(cors())
app.use(express.json())

app.use(passport.initialize())

app.post('/upload', uploader.single('photo'), (req, res) => {
  const source = req.file.path
  const destination = `${
    appRoot +
    '\\public\\avatars\\' +
    req.file.originalname.replace('.jpg', '') +
    nanoid(6)
  }_resized.jpeg`

  console.log('destination', destination)

  sharp(source)
    .resize(150, 150)
    .toFormat('jpeg')
    .toFile(destination, err => {
      if (err) {
        throw err
      }

      fs.unlinkSync(source)

      res.json({
        url: destination,
      })
    })
})

app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
)

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  AuthController.authCallback,
)

app.get(
  '/auth/me',
  passport.authenticate('jwt', { session: false }),
  AuthController.getMe,
)

app.get(
  '/auth/sms',
  passport.authenticate('jwt', { session: false }),
  AuthController.sendSms,
)

app.post(
  '/auth/sms/activate',
  passport.authenticate('jwt', { session: false }),
  AuthController.activate,
)

app.get(
  '/rooms',
  passport.authenticate('jwt', { session: false }),
  RoomController.index,
)
app.post(
  '/rooms',
  passport.authenticate('jwt', { session: false }),
  RoomController.create,
)
app.get(
  '/rooms/:id',
  passport.authenticate('jwt', { session: false }),
  RoomController.show,
)
app.delete(
  '/rooms/:id',
  passport.authenticate('jwt', { session: false }),
  RoomController.delete,
)

server.listen(3001, () => {
  console.log('Server runned')
})
