import express from 'express'
import { Code, User } from '../../models'
// var Code = require('../../models').Code

import { generateRandomCode } from '../../utils/generateRandomCode'

class AuthController {
  getMe(req: express.Request, res: express.Response) {
    res.json(req.user)
  }

  authCallback(req: express.Request, res: express.Response) {
    res.send(`
      <script>
        window.opener.postMessage('${JSON.stringify(req.user)}', '*')
        window.close();
      </script>
      `)
  }

  async activate(req: express.Request, res: express.Response) {
    const userId = req.user.id
    const smsCode = req.query.code
    const whereQuery = { code: smsCode, user_id: userId }

    if (!smsCode) {
      return res.status(400).send({ message: 'Введите код активации' })
    }

    try {
      const findCode = await Code.findOne({
        where: whereQuery,
      })

      if (findCode) {
        await Code.destroy({ where: whereQuery })
        await User.update({ isActive: 1 }, { where: { id: userId } })
        return res.status(200).send()
      }

      return res.status(500).json({ message: 'Код не найден' })
    } catch (error) {
      res.status(500).json({
        message: 'Ошибка при активации аккаунта',
      })
    }
  }

  async sendSms(req: express.Request, res: express.Response) {
    const phone = req.query.phone
    const userId = req.user.id
    const smsCode = generateRandomCode()

    if (!phone) {
      return res.status(400).send({
        message: 'Номер телефона не указан!',
      })
    }

    try {
      // const data = await Axios.get(
      //   `https://sms.ru/sms/send?api_id=${process.env.SMS_API_KEY}&to=79205797933&msg=${smsCode}&json=1`,
      // )

      const findCode = await Code.findOne({
        where: {
          user_id: userId,
        },
      })

      if (findCode) {
        return res.status(400).json({ message: 'Код уже был отправлен' })
      }

      await Code.create({
        code: smsCode,
        user_id: userId,
      })

      res.status(201).json({
        message: 'Всё ок',
      })
    } catch (error) {
      res.status(500).json({
        message: 'Ошибка при отправке СМС-кода',
      })
    }
  }
}

export default new AuthController()
