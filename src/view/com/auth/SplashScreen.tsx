import {StatusBar, StyleSheet, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {ResizeMode, Video} from 'expo-av'
// import {LinearGradient} from 'expo-linear-gradient'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {ErrorBoundary} from '#/view/com/util/ErrorBoundary'
import {GanderLogo} from '#/view/icons/GanderLogo'
import {atoms as a} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {Text} from '#/components/Typography'
import {CenteredView} from '../util/Views'

export const SplashScreen = ({
  onPressSignin,
  onPressCreateAccount,
}: {
  onPressSignin: () => void
  onPressCreateAccount: () => void
}) => {
  const {_} = useLingui()
  const insets = useSafeAreaInsets()

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Status bar hidden completely */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
        hidden
      />

      {/* Fullscreen video background */}
      <Video
        source={require('../../../../assets/start.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      {/* Gradient overlay with 20% opacity */}
      {/* <LinearGradient
        colors={['rgba(255, 255, 255, 0.2)', 'rgba(0, 0, 0, 0.8)']}
        style={StyleSheet.absoluteFill}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      /> */}

      {/* Additional black tint overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: 'rgba(0, 0, 0, 0.45)'},
        ]}
      />

      {/* UI Content */}
      <View style={[StyleSheet.absoluteFill, {paddingBottom: insets.bottom}]}>
        <CenteredView style={[a.flex_1]}>
          <ErrorBoundary>
            <View
              style={[
                {flex: 1},
                a.justify_center,
                a.align_center,
                {marginTop: 132.26},
              ]}>
              <GanderLogo width={265.02} height={64.13} />
            </View>

            <View
              testID="signinOrCreateAccount"
              style={[a.px_xl, a.gap_md, a.pb_2xl]}>
              <Text
                style={[
                  {
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 21,
                    fontWeight: '700',
                    lineHeight: 28,
                  },
                ]}>
                <Trans>
                  Better social media,{'\n'}from post to post to post
                </Trans>
              </Text>
              <Button
                testID="createAccountButton"
                onPress={onPressCreateAccount}
                label={_(msg`Create new account`)}
                accessibilityHint={_(
                  msg`Opens flow to create a new Bluesky account`,
                )}
                size="large"
                variant="solid"
                color="primary"
                style={{
                  borderRadius: 30,
                  backgroundColor: '#000000',
                  minHeight: 51,
                }}>
                <ButtonText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: '#ffffff',
                    flexShrink: 1,
                    fontSize: 15,
                    fontWeight: '600',
                  }}>
                  <Trans>Join Gander</Trans>
                </ButtonText>
              </Button>
              <Button
                testID="signInButton"
                onPress={onPressSignin}
                label={_(msg`Sign in`)}
                accessibilityHint={_(
                  msg`Opens flow to sign in to your existing Bluesky account`,
                )}
                size="large"
                variant="solid"
                color="secondary"
                style={{
                  borderRadius: 30,
                  backgroundColor: '#ffffff',
                  minHeight: 51,
                }}>
                <ButtonText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: '#000000',
                    flexShrink: 1,
                    fontSize: 15,
                    fontWeight: '600',
                  }}>
                  <Trans>Sign in</Trans>
                </ButtonText>
              </Button>
            </View>

            {/* <View
              style={[
                a.px_lg,
                a.pt_md,
                a.pb_2xl,
                a.justify_center,
                a.align_center,
              ]}>
              <AppLanguageDropdown />
            </View> */}
          </ErrorBoundary>
        </CenteredView>
      </View>
    </View>
  )
}
