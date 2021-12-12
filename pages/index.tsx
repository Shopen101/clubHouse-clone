import React from 'react'
// import Head from 'next/head'
import Link from 'next/link'

import { WelcomeStep } from '../components/steps/WelcomeStep'
import { EnterNameStep } from '../components/steps/EnterNameStep'
import { TwitterStep } from '../components/steps/TwitterStep'
import { EnterCodeStep } from '../components/steps/EnterCodeStep'
import { ChooseAvatarStep } from '../components/steps/ChooseAvatarStep'
import { EnterPhoneStep } from '../components/steps/EnterPhoneStep'

const stepsComponent = {
  0: WelcomeStep,
  1: EnterNameStep,
  2: TwitterStep,
  3: ChooseAvatarStep,
  4: EnterPhoneStep,
  5: EnterCodeStep,
}

export default function Home() {
  const [step, setStep] = React.useState<number>(5)
  const Step = stepsComponent[step]

  return (
    <div>
      <Step />
    </div>
  )
}
