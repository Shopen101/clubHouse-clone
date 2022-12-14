import React from 'react'
// import Head from 'next/head'
import Link from 'next/link'

import { WelcomeStep } from '../components/steps/WelcomeStep'
import { EnterNameStep } from '../components/steps/EnterNameStep'
import { GitHubStep } from '../components/steps/GitHubStep'
import { EnterCodeStep } from '../components/steps/EnterCodeStep'
import { ChooseAvatarStep } from '../components/steps/ChooseAvatarStep'
import { EnterPhoneStep } from '../components/steps/EnterPhoneStep'
import { checkAuth } from '../utils/checkAuth'
import { Axios } from '../core/axios'

const stepsComponent = {
  0: WelcomeStep,
  1: GitHubStep,
  2: EnterNameStep,
  3: ChooseAvatarStep,
  4: EnterPhoneStep,
  5: EnterCodeStep,
}

export type UserData = {
  id: number
  fullName: string
  avatarUrl: string
  isActive: number
  username: string
  phone: string
  token?: string
}

type MainContextProps = {
  onNextStep: () => void
  setUserData: React.Dispatch<React.SetStateAction<UserData>>
  setFieldValue: (field: keyof UserData, value: string) => void
  step: number
  userData?: UserData
}

export const MainContext = React.createContext<MainContextProps>(
  {} as MainContextProps,
)

const getUserData = (): UserData | null => {
  try {
    return JSON.parse(window.localStorage.getItem('userData'))
  } catch (error) {
    return null
  }
}

const getFormStep = () => {
  const json = getUserData()

  if (json) {
    if (json.phone) {
      return 5
    } else {
      return 4
    }
  }

  return 0
}

export default function Home() {
  const [step, setStep] = React.useState<number>(getFormStep())
  const [userData, setUserData] = React.useState<UserData | undefined>()
  const Step = stepsComponent[step]

  const onNextStep = () => {
    setStep(prev => prev + 1)
  }

  const setFieldValue = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const json = getUserData()

      if (json) {
        setUserData(json)
        setStep(getFormStep())
      }
    }
  }, [])

  React.useEffect(() => {
    if (userData) {
      window.localStorage.setItem(
        'userData',
        userData ? JSON.stringify(userData) : '',
      )
      Axios.defaults.headers['Authorization'] = 'Bearer ' + userData.token
    }
  }, [userData])

  return (
    <MainContext.Provider
      value={{ step, onNextStep, userData, setUserData, setFieldValue }}>
      <Step data-cytue />
    </MainContext.Provider>
  )
}

export const getServerSideProps = async ctx => {
  try {
    const user = await checkAuth(ctx)
 
    if (user) {
      return {
        props: {},
        redirect: {
          permanent: false,
          destination: '/rooms',
        },
      }
    }

    return { props: {} }
  } catch (error) {
    console.log(error)
  }
}
