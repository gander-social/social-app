import {useCallback, useState} from 'react'
import {ActivityIndicator, Keyboard, View} from 'react-native'
import {useWindowDimensions} from 'react-native'
import {BskyAgent} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {logEvent} from '#/lib/statsig/statsig'
import {cleanError, isNetworkError} from '#/lib/strings/errors'
import {checkAndFormatResetCode} from '#/lib/strings/password'
import {logger} from '#/logger'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonIcon, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import {FormError} from '#/components/forms/FormError'
import * as TextField from '#/components/forms/TextField'
import {ChevronRight_Stroke2_Corner0_Rounded as Chevron} from '#/components/icons/Chevron'
import {TimesLarge_Stroke2_Corner0_Rounded as Times} from '#/components/icons/Times'
import {Text} from '#/components/Typography'

export function ResetPasswordDialog({
  control,
  onPasswordSet,
  serviceUrl,
  error,
  setError,
  email,
}: {
  onPasswordSet: () => void
  control: Dialog.DialogOuterProps['control']
  onSelect: (url: string) => void
  error: string
  serviceUrl: string
  setError: (v: string) => void
  email: string
}) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [resetCode, setResetCode] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [passwordVisible, setPasswordVisible] = useState(false)

  const {height} = useWindowDimensions()
  const {_} = useLingui()
  const t = useTheme()

  const onClose = useCallback(() => {
    setError('')
  }, [setError])
  const onPressBack = () => {
    control.close()
  }
  const onSubmitPress = useCallback(async () => {
    // Check that the code is correct. We do this again just incase the user enters the code after their pw and we
    // don't get to call onBlur first
    const formattedCode = checkAndFormatResetCode(resetCode)

    if (!formattedCode) {
      setError(
        _(
          msg`You have entered an invalid code. It should look like XXXXX-XXXXX.`,
        ),
      )
      logEvent('signin:passwordResetFailure', {})
      return
    }

    // TODO Better password strength check
    if (!password) {
      setError(_(msg`Please enter a password.`))
      return
    }

    setError('')
    setIsProcessing(true)

    try {
      const agent = new BskyAgent({service: serviceUrl})
      await agent.com.atproto.server.resetPassword({
        token: formattedCode,
        password,
      })
      control.close()
      onPasswordSet()
      logEvent('signin:passwordResetSuccess', {})
    } catch (e: any) {
      const errMsg = e.toString()
      logger.warn('Failed to set new password', {error: e})
      logEvent('signin:passwordResetFailure', {})
      setIsProcessing(false)
      if (isNetworkError(e)) {
        setError(
          _(
            msg`Unable to contact your service. Please check your Internet connection.`,
          ),
        )
      } else {
        setError(cleanError(errMsg))
      }
    }
  }, [_, control, onPasswordSet, password, resetCode, serviceUrl, setError])

  const onBlur = () => {
    const formattedCode = checkAndFormatResetCode(resetCode)
    if (!formattedCode) {
      setError(
        _(
          msg`You have entered an invalid code. It should look like XXXXX-XXXXX.`,
        ),
      )
      return
    }
    setResetCode(formattedCode)
  }
  const onResenPress = async () => {
    setError('')
    setIsProcessing(true)

    try {
      const agent = new BskyAgent({service: serviceUrl})
      await agent.com.atproto.server.requestPasswordReset({email})
      Keyboard.dismiss()
    } catch (e: any) {
      const errMsg = e.toString()
      logger.warn('Failed to request password reset', {error: e})
      setIsProcessing(false)
      if (isNetworkError(e)) {
        setError(
          _(
            msg`Unable to contact your service. Please check your Internet connection.`,
          ),
        )
      } else {
        setError(cleanError(errMsg))
      }
    }
  }
  const onShowPassowrd = () => {
    setPasswordVisible(v => !v)
  }
  return (
    <Dialog.Outer
      control={control}
      onClose={onClose}
      nativeOptions={{minHeight: height / 2}}>
      <View style={[a.flex_row, a.align_center, a.mt_2xl, a.px_2xl]}>
        <Text
          style={[a.flex_1, a.text_center, a.text_lg, a.font_bold, a.pl_lg]}>
          <Trans>Reset password</Trans>
        </Text>
        <Button
          variant="ghost"
          size="tiny"
          color="secondary"
          shape="round"
          label={_(msg`Dismiss getting started guide`)}
          onPress={() => {
            control.close()
          }}>
          <ButtonIcon icon={Times} size="sm" />
        </Button>
      </View>

      <Dialog.ScrollableInner
        accessibilityDescribedBy="dialog-description"
        accessibilityLabelledBy="dialog-title">
        <View style={[a.relative, a.gap_2xl, a.w_full]}>
          <Text style={[a.text_md, a.font_extra_bold]}>
            <Trans>Enter the code we sent to ben@theartdepartment.studio</Trans>
          </Text>

          <View>
            <TextField.Root>
              <TextField.Input
                testID="resetCodeInput"
                label={_(msg`Looks like XXXXX-XXXXX`)}
                autoCapitalize="none"
                autoFocus={true}
                autoCorrect={false}
                autoComplete="off"
                value={resetCode}
                onChangeText={setResetCode}
                onFocus={() => setError('')}
                onBlur={onBlur}
                isFirst={true}
                editable={!isProcessing}
                accessibilityHint={_(
                  msg`Input code sent to your email for password reset`,
                )}
              />
            </TextField.Root>

            <TextField.Root>
              <TextField.Input
                isLast={true}
                testID="newPasswordInput"
                label={_(msg`New Password`)}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                returnKeyType="done"
                secureTextEntry={!passwordVisible}
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                // onSubmitEditing={onPressNext}
                editable={!isProcessing}
                accessibilityHint={_(msg`Input new password`)}
              />
              <Button
                testID="showPasswordButton"
                onPress={onShowPassowrd}
                label={_(msg`Show password`)}
                accessibilityHint={_(msg`Show password`)}
                variant="ghost"
                color="link">
                <ButtonText>
                  {passwordVisible ? <Trans>Hide</Trans> : <Trans>Show</Trans>}
                </ButtonText>
              </Button>
            </TextField.Root>
          </View>
          <FormError error={error} />
          <Button
            hitSlop={24}
            testID="chooseAddAccountBtn"
            style={[a.flex_1, a.py_sm]}
            onPress={onResenPress}
            label={_(msg`Sign in to account that is not listed`)}>
            <View style={[a.flex_row, a.align_center]}>
              <Text style={[a.flex_1, a.flex_row, a.font_medium, a.text_md]}>
                <Trans>Send a new code</Trans>
              </Text>
              <Chevron size="sm" style={[t.atoms.text]} />
            </View>
          </Button>
          <View style={a.flex_1} />
          <View style={[a.flex_row, a.align_center, a.pt_lg]}>
            <Button
              label={_(msg`Back`)}
              variant="solid"
              color="secondary"
              size="large"
              onPress={onPressBack}>
              <ButtonText>
                <Trans>Back</Trans>
              </ButtonText>
            </Button>
            <View style={a.flex_1} />
            {isProcessing ? (
              <ActivityIndicator />
            ) : (
              <Button
                label={_(msg`Submit`)}
                variant="solid"
                color="primary"
                size="large"
                onPress={onSubmitPress}>
                <ButtonText>
                  <Trans>Submit</Trans>
                </ButtonText>
              </Button>
            )}
            {isProcessing ? (
              <Text style={[t.atoms.text_contrast_high, a.pl_md]}>
                <Trans>Updating...</Trans>
              </Text>
            ) : undefined}
          </View>
        </View>
      </Dialog.ScrollableInner>
    </Dialog.Outer>
  )
}
