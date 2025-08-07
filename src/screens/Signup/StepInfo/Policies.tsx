import {type ReactElement} from 'react'
import {View} from 'react-native'
import {type ComAtprotoServerDescribeServer} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {atoms as a, useTheme} from '#/alf'
import {CircleInfo_Stroke2_Corner0_Rounded as CircleInfo} from '#/components/icons/CircleInfo'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'

export const Policies = ({
  serviceDescription,
  needsGuardian,
  under13,
}: {
  serviceDescription: ComAtprotoServerDescribeServer.OutputSchema
  needsGuardian: boolean
  under13: boolean
}) => {
  const t = useTheme()
  const {_} = useLingui()

  if (!serviceDescription) {
    return <View />
  }

  const tos = validWebLink(serviceDescription.links?.termsOfService)
  const pp = validWebLink(serviceDescription.links?.privacyPolicy)

  if (!tos && !pp) {
    return (
      <View style={[a.flex_row, a.align_center, a.gap_xs]}>
        <CircleInfo size="md" fill={t.atoms.text_contrast_low.color} />

        <Text style={[t.atoms.text_contrast_medium]}>
          <Trans>
            This service has not provided terms of service or a privacy policy.
          </Trans>
        </Text>
      </View>
    )
  }

  let els: ReactElement
  els = (
    <Trans>
      By selecting Agree and continue below, I agree to Gander's{' '}
      <InlineLinkText
        label={_(msg`Read the Gander Terms of Service`)}
        key="tos"
        to={tos || '#'}
        style={{
          color: '#C30B0D',
          textDecorationLine: 'underline',
          fontSize: 15,
          fontWeight: 'medium',
        }}>
        Terms of Service
      </InlineLinkText>
      ,{' '}
      <InlineLinkText
        label={_(msg`Read the Gander Payments Terms of Service`)}
        key="payments"
        to="#"
        style={{
          color: '#C30B0D',
          textDecorationLine: 'underline',
          fontSize: 15,
          fontWeight: 'medium',
        }}>
        Payments Terms of Service
      </InlineLinkText>
      ,{' '}
      <InlineLinkText
        label={_(msg`Read the Gander Privacy Policy`)}
        key="pp"
        to={pp || '#'}
        style={{
          color: '#C30B0D',
          textDecorationLine: 'underline',
          fontSize: 15,
          fontWeight: 'medium',
        }}>
        Privacy Policy
      </InlineLinkText>
      ,{' '}
      <InlineLinkText
        label={_(msg`Read the Gander Nondiscrimination Policy`)}
        key="nondiscrimination"
        to="#"
        style={{
          color: '#C30B0D',
          textDecorationLine: 'underline',
          fontSize: 15,
          fontWeight: 'medium',
        }}>
        Nondiscrimination Policy
      </InlineLinkText>
      , and{' '}
      <InlineLinkText
        label={_(msg`Read the Gander Biometric Terms of Service`)}
        key="biometric"
        to="#"
        style={{
          color: '#C30B0D',
          textDecorationLine: 'underline',
          fontSize: 15,
          fontWeight: 'medium',
        }}>
        Biometric Terms of Service
      </InlineLinkText>
      .
    </Trans>
  )

  return (
    <View style={[a.gap_sm]}>
      {els ? (
        <Text
          style={[
            a.leading_snug,
            {color: '#000000', fontSize: 15, fontWeight: 'medium'},
          ]}>
          {els}
        </Text>
      ) : null}

      {under13 ? (
        <Text style={[a.font_bold, a.leading_snug, t.atoms.text_contrast_high]}>
          <Trans>
            You must be 13 years of age or older to create an account.
          </Trans>
        </Text>
      ) : needsGuardian ? (
        <Text style={[a.font_bold, a.leading_snug, t.atoms.text_contrast_high]}>
          <Trans>
            If you are not yet an adult according to the laws of your country,
            your parent or legal guardian must read these Terms on your behalf.
          </Trans>
        </Text>
      ) : undefined}
    </View>
  )
}

function validWebLink(url?: string): string | undefined {
  return url && (url.startsWith('http://') || url.startsWith('https://'))
    ? url
    : undefined
}
