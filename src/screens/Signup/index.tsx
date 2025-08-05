import {useEffect, useReducer, useState} from 'react'
import {AppState, type AppStateStatus, View} from 'react-native'
import Animated, {FadeIn, LayoutAnimationConfig} from 'react-native-reanimated'
import Svg, {Path} from 'react-native-svg'
import {AppBskyGraphStarterpack} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useServiceQuery} from '#/state/queries/service'
import {useStarterPackQuery} from '#/state/queries/starter-packs'
import {useActiveStarterPack} from '#/state/shell/starter-pack'
import {LoggedOutLayout} from '#/view/com/util/layouts/LoggedOutLayout'
import {
  initialState,
  reducer,
  SignupContext,
  SignupStep,
  useSubmitSignup,
} from '#/screens/Signup/state'
import {StepCaptcha} from '#/screens/Signup/StepCaptcha'
import {StepHandle} from '#/screens/Signup/StepHandle'
import {StepInfo} from '#/screens/Signup/StepInfo'
import {atoms as a, useBreakpoints} from '#/alf'
import {LinearGradientBackground} from '#/components/LinearGradientBackground'
import {Text} from '#/components/Typography'
import * as bsky from '#/types/bsky'

export function Signup({onPressBack}: {onPressBack: () => void}) {
  const {_} = useLingui()
  // const t = useTheme()
  const [state, dispatch] = useReducer(reducer, initialState)
  const {gtMobile} = useBreakpoints()
  const submit = useSubmitSignup()

  const activeStarterPack = useActiveStarterPack()
  const {
    data: starterPack,
    isFetching: isFetchingStarterPack,
    isError: isErrorStarterPack,
  } = useStarterPackQuery({
    uri: activeStarterPack?.uri,
  })

  const [isFetchedAtMount] = useState(starterPack != null)
  const showStarterPackCard =
    activeStarterPack?.uri && !isFetchingStarterPack && starterPack

  const {
    data: serviceInfo,
    isFetching,
    isError,
    refetch,
  } = useServiceQuery(state.serviceUrl)

  useEffect(() => {
    if (isFetching) {
      dispatch({type: 'setIsLoading', value: true})
    } else if (!isFetching) {
      dispatch({type: 'setIsLoading', value: false})
    }
  }, [isFetching])

  useEffect(() => {
    if (isError) {
      dispatch({type: 'setServiceDescription', value: undefined})
      dispatch({
        type: 'setError',
        value: _(
          msg`Unable to contact your service. Please check your Internet connection.`,
        ),
      })
    } else if (serviceInfo) {
      dispatch({type: 'setServiceDescription', value: serviceInfo})
      dispatch({type: 'setError', value: ''})
    }
  }, [_, serviceInfo, isError])

  useEffect(() => {
    if (state.pendingSubmit) {
      if (!state.pendingSubmit.mutableProcessed) {
        state.pendingSubmit.mutableProcessed = true
        submit(state, dispatch)
      }
    }
  }, [state, dispatch, submit])

  // Track app backgrounding during signup
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background') {
          dispatch({type: 'incrementBackgroundCount'})
        }
      },
    )

    return () => subscription.remove()
  }, [])

  return (
    <SignupContext.Provider value={{state, dispatch}}>
      <LoggedOutLayout
        leadin=""
        title={_(msg`Create Account`)}
        description={_(msg`We're so excited to have you join us!`)}
        scrollable>
        <View testID="createAccount" style={a.flex_1}>
          {showStarterPackCard &&
          bsky.dangerousIsType<AppBskyGraphStarterpack.Record>(
            starterPack.record,
            AppBskyGraphStarterpack.isRecord,
          ) ? (
            <Animated.View entering={!isFetchedAtMount ? FadeIn : undefined}>
              <LinearGradientBackground
                style={[a.mx_lg, a.p_lg, a.gap_sm, a.rounded_sm]}>
                <Text style={[a.font_bold, a.text_xl, {color: 'white'}]}>
                  {starterPack.record.name}
                </Text>
                <Text style={[{color: 'white'}]}>
                  {starterPack.feeds?.length ? (
                    <Trans>
                      You'll follow the suggested users and feeds once you
                      finish creating your account!
                    </Trans>
                  ) : (
                    <Trans>
                      You'll follow the suggested users once you finish creating
                      your account!
                    </Trans>
                  )}
                </Text>
              </LinearGradientBackground>
            </Animated.View>
          ) : null}
          <View
            style={[
              a.flex_1,
              a.px_xl,
              a.pt_2xl,
              !gtMobile && {paddingBottom: 100},
            ]}>
            <View style={[a.gap_sm, a.pb_3xl]}>
              <Text
                style={[{fontWeight: '700', color: '#000000', fontSize: 16}]}>
                <Trans>
                  Step {state.activeStep + 1} of{' '}
                  {state.serviceDescription &&
                  !state.serviceDescription.phoneVerificationRequired
                    ? '2'
                    : '3'}
                </Trans>
              </Text>
              {state.activeStep === SignupStep.INFO && (
                <View style={[a.mt_lg, a.mb_md]}>
                  <Svg width={48} height={49} viewBox="0 0 48 49" fill="none">
                    <Path
                      d="M24 2.57129C36.1109 2.57136 45.9286 12.3893 45.9287 24.5C45.9286 36.6109 36.1109 46.4286 24 46.4287C11.8893 46.4286 2.07136 36.6109 2.07129 24.5C2.07137 12.3893 11.8893 2.57136 24 2.57129ZM24 33.8613C21.5619 33.8613 19.1647 34.4885 17.0391 35.6826H17.0381C15.2917 36.6635 13.7773 38.0009 12.5889 39.6016C15.7618 42.0029 19.7141 43.4287 24 43.4287C28.2859 43.4287 32.2382 42.0029 35.4111 39.6016C34.2225 38.001 32.7084 36.6635 30.9619 35.6826C28.8361 34.4883 26.4383 33.8614 24 33.8613ZM24 5.57129C13.5461 5.57136 5.07137 14.0462 5.07129 24.5C5.07133 29.5851 7.07703 34.2017 10.3398 37.6025C11.7543 35.7575 13.5313 34.2121 15.5693 33.0674L16.0557 32.8047C18.5069 31.5294 21.2316 30.8613 24 30.8613C26.9528 30.8614 29.8562 31.6211 32.4307 33.0674L32.9082 33.3457C34.7469 34.4575 36.3572 35.9025 37.6602 37.6016C40.9228 34.2007 42.9287 29.5849 42.9287 24.5C42.9286 14.0462 34.454 5.57136 24 5.57129ZM24 10.4287C29.1677 10.4289 33.3564 14.6184 33.3564 19.7861C33.3562 24.9536 29.1675 29.1424 24 29.1426C18.8325 29.1424 14.6428 24.9537 14.6426 19.7861C14.6426 14.6184 18.8323 10.4288 24 10.4287ZM24 13.4287C20.4892 13.4288 17.6426 16.2753 17.6426 19.7861C17.6428 23.2968 20.4893 26.1424 24 26.1426C27.5107 26.1424 30.3562 23.2968 30.3564 19.7861C30.3564 16.2753 27.5108 13.4289 24 13.4287Z"
                      fill="#C30B0D"
                    />
                  </Svg>
                </View>
              )}
              <Text style={[a.text_3xl, a.font_bold]}>
                {state.activeStep === SignupStep.INFO ? (
                  <>
                    <Trans>Sign up for a {'\n'}Gander Social account.</Trans>
                  </>
                ) : state.activeStep === SignupStep.HANDLE ? (
                  <Trans>Choose your username</Trans>
                ) : (
                  <Trans>Complete the challenge</Trans>
                )}
              </Text>
            </View>
            <View style={[a.flex_1, a.h_full]}>
              <LayoutAnimationConfig skipEntering skipExiting>
                {state.activeStep === SignupStep.INFO ? (
                  <StepInfo
                    onPressBack={onPressBack}
                    isLoadingStarterPack={
                      isFetchingStarterPack && !isErrorStarterPack
                    }
                    isServerError={isError}
                    refetchServer={refetch}
                  />
                ) : state.activeStep === SignupStep.HANDLE ? (
                  <StepHandle />
                ) : (
                  <StepCaptcha />
                )}
              </LayoutAnimationConfig>
            </View>

            {/* <Divider /> */}

            {/* <View
              style={[a.w_full, a.py_lg, a.flex_row, a.gap_md, a.align_center]}>
              <AppLanguageDropdown />
              <Text
                style={[
                  a.flex_1,
                  t.atoms.text_contrast_medium,
                  !gtMobile && a.text_md,
                ]}>
                <Trans>Having trouble?</Trans>{' '}
                <InlineLinkText
                  label={_(msg`Contact support`)}
                  to={FEEDBACK_FORM_URL({email: state.email})}
                  style={[!gtMobile && a.text_md]}>
                  <Trans>Contact support</Trans>
                </InlineLinkText>
              </Text>
            </View> */}
          </View>
        </View>
      </LoggedOutLayout>
    </SignupContext.Provider>
  )
}
