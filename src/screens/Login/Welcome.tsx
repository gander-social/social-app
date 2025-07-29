import {ImageBackground, Text, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {colors} from '#/lib/styles'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {HandLine} from '#/components/icons/HandLine'

const onboardingContent = [
  {
    title: 'Your feed. Your rules.',
    description:
      'You decide what content matters to you, and how to consume it. No dark patterns or algorithmic manipulation, ever.',
  },
  {
    title: 'Hosted in Canada.',
    description:
      'Your data stays here, on sovereign servers. Post in Canada only or internationally. The choice is yours.',
  },
  {
    title: 'Community moderated.',
    description:
      'Free expression matters. So do boundaries. Gander follows the spirit of the Charter to strike that balance.',
  },
]

export function Welcome() {
  const t = useTheme()
  const {_} = useLingui()
  return (
    <ImageBackground
      style={[a.flex_1, a.px_2xl, a.py_4xl]}
      source={require('../../../assets/images/welcome.png')}>
      <View style={[a.flex_1, a.justify_center]}>
        <HandLine
          stroke={colors.white}
          strokeWidth={2}
          fill={'none'}
          height={45}
          width={46}
        />
        <Text
          style={[a.text_4xl, a.font_bold, t.atoms.text_inverted, a.my_2xl]}>
          <Trans>Nicely done.Welcome to Gander.</Trans>
        </Text>
        <Text style={[a.text_lg, a.font_bold, t.atoms.text_inverted, a.my_2xl]}>
          <Trans>This is where social media gets sane again.</Trans>
        </Text>
        <View style={a.gap_2xl}>
          {onboardingContent.map(i => {
            return (
              <View key={i.title}>
                <Text style={[a.text_xl, a.font_bold, t.atoms.text_inverted]}>
                  <Trans>{i.title}</Trans>
                </Text>
                <Text
                  style={[
                    a.text_sm,
                    a.font_normal,
                    t.atoms.text_inverted,
                    a.pt_s6,
                  ]}>
                  <Trans>{i.description}</Trans>
                </Text>
              </View>
            )
          })}
          <Button
            label={_(msg`Learnmore`)}
            color="link"
            variant="ghost"
            size="small"
            style={[a.self_start, a.py_0, a.px_0]}
            onPress={() => {}}>
            <ButtonText style={[t.atoms.text_inverted]}>
              <Trans>Learn more</Trans>
            </ButtonText>
          </Button>
        </View>
      </View>
      <Button
        label={_(msg`GetStarted`)}
        color="cta_red"
        variant="solid"
        size="small"
        onPress={() => {}}>
        <ButtonText>
          <Trans>Get started</Trans>
        </ButtonText>
      </Button>
    </ImageBackground>
  )
}
