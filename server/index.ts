import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import sharp from 'sharp'
import fs from 'fs'
import appRoot from 'app-root-path'
import { nanoid } from 'nanoid'

dotenv.config({
  path: 'server/.env',
})

import './core/db'

import { passport } from './core/passport'
import AuthController from './controllers/AuthController'
import RoomController from './controllers/RoomController'
import { uploader } from './core/uploader'
sharp.cache({ files: 0 })

const app = express()

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

app.get(
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

app.listen(3001, () => {
  console.log('Server runned')
})
